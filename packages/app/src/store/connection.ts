import { AnyBridgePayload, BridgeObjectsType, BridgePayload, BridgePayloadType, BridgeRequestPayload, BridgeServer, Course, CourseContentItem, GradeMapping, StreamEntry } from "@bbdash/shared";
import { batch } from "react-redux";
import { store } from ".";
import { DataSource } from "../transformers/data-source-spec";
import { coursesUpdated } from "./reducers/courses";
import { dataUpdated } from "./reducers/data";

function dispatchGrades(grades: GradeMapping) {
    store.dispatch(dataUpdated({
        dataSource: DataSource.grades,
        data: Object.entries(grades).map(([courseID, grades]) => ({ courseID, grades }))
    }));
}

function dispatchStream(entries: StreamEntry[]) {
    store.dispatch(dataUpdated({
        dataSource: DataSource.stream,
        data: entries
    }));
}

function dispatchContents(contents: Record<string, CourseContentItem[]>) {
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

export async function reloadGrades() {
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.grades));
}

export async function reloadStream(cache = true) {
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.streamEntries));
}

export async function reloadContents(cache = true) {
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.contents));
}

export async function reloadCourses(cache = false) {
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.courses));
}

export async function reloadAll(cache = true) {
    SlaveBridgeServer.send(REQUEST(BridgeObjectsType.all));
}
