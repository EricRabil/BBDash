import { AnyBridgePayload, BridgeObjectsType, BridgePayload, BridgePayloadType, BridgeRequestPayload, BridgeServer, Course, CourseContentItem, GradeMapping, StreamEntry } from "@bbdash/shared";
import { batch } from "react-redux";
import { store } from ".";
import { DataSource } from "../transformers/data-source-spec";
import { coursesUpdated } from "./reducers/courses";
import { dataUpdated, syncStateChanged } from "./reducers/data";

function dispatchGrades(grades: GradeMapping) {
    setSyncing(DataSource.grades, false);
    store.dispatch(dataUpdated({
        dataSource: DataSource.grades,
        data: Object.entries(grades).map(([courseID, grades]) => ({ courseID, grades }))
    }));
}

function dispatchStream(entries: StreamEntry[]) {
    setSyncing(DataSource.stream, false);
    store.dispatch(dataUpdated({
        dataSource: DataSource.stream,
        data: entries
    }));
}

function dispatchContents(contents: Record<string, CourseContentItem[]>) {
    setSyncing(DataSource.contents, false);
    store.dispatch(dataUpdated({
        dataSource: DataSource.contents,
        data: Object.entries(contents).map(([courseID, courseContents]) => courseContents.map(content => Object.assign(content, { courseID }))).reduce((acc, courseContents) => (acc.push(...courseContents), acc), [])
    }));
}

function dispatchCourses(courses: Course[]) {
    store.dispatch(coursesUpdated(courses));
}

const SlaveBridgeServer = new class SlaveBridgeServer extends BridgeServer {
    handlePayload(payload: AnyBridgePayload, sender: Window): boolean {
        if (super.handlePayload(payload, sender)) return true;

        switch (payload.type) {
        case BridgePayloadType.response:
            switch (payload.objectsType) {
            case BridgeObjectsType.courses:
                dispatchCourses(payload.objects);
                break;
            case BridgeObjectsType.contents:
                dispatchContents(payload.objects);
                break;
            case BridgeObjectsType.grades:
                dispatchGrades(payload.objects);
                break;
            case BridgeObjectsType.streamEntries:
                dispatchStream(payload.objects);
                break;
            case BridgeObjectsType.all:
                batch(() => {
                    dispatchCourses(payload.objects.courses);
                    dispatchContents(payload.objects.contents);
                    dispatchGrades(payload.objects.grades);
                    dispatchStream(payload.objects.streamEntries);
                });
            }
            return true;
        }

        return false;
    }

    send(payload: AnyBridgePayload) {
        BridgePayload.send(payload, window.top);
    }
};

window.addEventListener("message", message => {
    console.log(message.source === window.top);
    if (message.source !== window.top) {
        return;
    }
    
    const payload = BridgePayload.deserialize(message.data);
    if (!payload) return;

    SlaveBridgeServer.handlePayload(payload, message.source);
});

const REQUEST = (type: BridgeObjectsType): BridgeRequestPayload => ({ type: BridgePayloadType.request, objectsType: type });

function setSyncing(sources: DataSource | DataSource[], syncing: boolean) {
    if (Array.isArray(sources) && sources.length > 1) {
        batch(() => {
            sources.forEach(source => {
                store.dispatch(syncStateChanged({
                    dataSource: source,
                    syncing
                }));
            });
        });
    } else {
        const source = Array.isArray(sources) ? sources[0] : sources;
        if (!source) return;

        store.dispatch(syncStateChanged({
            dataSource: source,
            syncing
        }));
    }
}

export async function reloadGrades() {
    setSyncing(DataSource.grades, true);
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.grades));
}

export async function reloadStream() {
    setSyncing(DataSource.stream, true);
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.streamEntries));
}

export async function reloadContents() {
    setSyncing(DataSource.contents, true);
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.contents));
}

export async function reloadCourses() {
    setSyncing(DataSource.grades, true);
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.courses));
}

export function reloadSome(sources: DataSource[]) {
    sources.forEach(source => {
        switch (source) {
        case DataSource.stream:
            reloadStream();
            break;
        case DataSource.contents:
            reloadContents();
            break;
        case DataSource.grades:
            reloadGrades();
            break;
        }
    });
}

export function reloadOne(source: DataSource) {
    reloadSome([source]);
}

export async function reloadAll() {
    try {
        const syncStates = Object.entries(store.getState().data.syncState) as [DataSource, boolean][];

        const syncing = syncStates.filter(([ , syncing ]) => syncing);

        if (syncing.length > 0) {
            reloadSome(syncStates.filter(([ , syncing ]) => !syncing).map(([ type ]) => type));
            return;
        }
    } catch (e) {
        console.log(e);
        return;
    }

    setSyncing([
        DataSource.stream,
        DataSource.contents,
        DataSource.grades
    ], true);
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.all));
}
