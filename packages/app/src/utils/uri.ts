import { Course, StreamEntry } from "@bbdash/shared";
import { ColumnItem } from "../hooks/usePersistentColumns";
import { store } from "../store";
import { TaggedCourseContentItem, TaggedGradebookEntries } from "../transformers/data-source-spec";
import { persistentColumnsRef } from "./persist";

export enum BBEntityType {
    column = "column",
    course = "course",
    streamEntry = "streamEntry",
    gradebook = "gradebook",
    courseContentItem = "content"
}

function resolveColumn(uid: string | number): ColumnItem | null {
    return persistentColumnsRef.value.find(column => column.uid === +uid) || null;
}

function resolveCourse(id: string): Course | null {
    return store.getState().courses[id] || null;
}

function resolveStreamEntry(id: string): StreamEntry | null {
    return store.getState().data.stream[id] || null;
}

function resolveGradebook(id: string): TaggedGradebookEntries | null {
    return store.getState().data.grades[id] || null;
}

function resolveCourseContentItem(id: string): TaggedCourseContentItem | null {
    return store.getState().data.contents[id] || null;
}

/**
 * Encodes and decodes string representations to/from commonly used data objects.
 */
export class BBURI {
    public static fromRaw(raw: string): BBURI | null {
        const [ type, id ] = raw.split("/");

        if (!id) return null;

        switch (type) {
        case BBEntityType.column:
        case BBEntityType.course:
        case BBEntityType.streamEntry:
        case BBEntityType.gradebook:
        case BBEntityType.courseContentItem:
            return new BBURI(type, id);
        default:
            return null;
        }
    }

    public static fromColumn({ uid }: ColumnItem): BBURI {
        return BBURI.forColumn(uid);
    }

    public static forColumn(uid: string | number): BBURI {
        return new BBURI(BBEntityType.column, uid.toString());
    }

    public static fromCourse({ id }: Course): BBURI {
        return this.forCourse(id);
    }

    public static forCourse(id: string): BBURI {
        return new BBURI(BBEntityType.course, id);
    }

    public static fromStreamEntry({ se_id }: StreamEntry): BBURI {
        return this.forStreamEntry(se_id);
    }

    public static forStreamEntry(id: string): BBURI {
        return new BBURI(BBEntityType.streamEntry, id);
    }

    public static fromGradebook({ courseID }: TaggedGradebookEntries): BBURI {
        return this.forGradebook(courseID);
    }

    public static forGradebook(id: string): BBURI {
        return new BBURI(BBEntityType.gradebook, id);
    }

    public static fromCourseContentItem({ id }: TaggedCourseContentItem): BBURI {
        return this.forCourseContentItem(id);
    }

    public static forCourseContentItem(id: string): BBURI {
        return new BBURI(BBEntityType.courseContentItem, id);
    }

    public constructor(public type: BBEntityType, public id: string) {
    }

    public toString(): string {
        return `${this.type}/${this.id}`;
    }

    public get raw(): string {
        return this.toString();
    }

    public get isColumn(): boolean {
        return this.type === BBEntityType.column;
    }

    public get column(): ColumnItem | null {
        if (!this.isColumn) return null;
        return resolveColumn(this.id);
    }

    public get isCourse(): boolean {
        return this.type === BBEntityType.course;
    }

    public get course(): Course | null {
        const courseID = this.courseID;
        if (!courseID) return null;
        return resolveCourse(courseID);
    }

    public get courseID(): string | undefined | null {
        switch (this.type) {
        case BBEntityType.course:
            return this.id;
        case BBEntityType.streamEntry:
            return this.streamEntry?.se_courseId;
        case BBEntityType.gradebook:
            return this.gradebook?.courseID;
        case BBEntityType.courseContentItem:
            return this.courseContentItem?.courseID;
        default:
            return null;
        }
    }

    public get isStreamEntry(): boolean {
        return this.type === BBEntityType.streamEntry;
    }

    public get streamEntry(): StreamEntry | null {
        if (this.type !== BBEntityType.streamEntry) return null;
        return resolveStreamEntry(this.id);
    }

    public get isGradebook(): boolean {
        return this.type === BBEntityType.gradebook;
    }

    public get gradebook(): TaggedGradebookEntries | null {
        if (!this.isGradebook) return null;
        return resolveGradebook(this.id);
    }

    public get isCourseContentItem(): boolean {
        return this.type === BBEntityType.courseContentItem;
    }

    public get courseContentItem(): TaggedCourseContentItem | null {
        if (!this.isCourseContentItem) return null;
        return resolveCourseContentItem(this.id);
    }
}