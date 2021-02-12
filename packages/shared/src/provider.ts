import { StreamEntry } from "./activity";
import { Course } from "./course";
import { GradeMapping } from "./grades";

export interface DataProvider {
    courses: {
        all(): Promise<Course[]>;
    }
    grades: {
        all(): Promise<GradeMapping>;
    }
    stream: {
        allEntries(): Promise<StreamEntry[]>;
    }
}