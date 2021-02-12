import { Course, DataProvider, GradeMapping, StreamEntry } from "@bbdash/shared";
import axios from "axios";

class APICategory {
    constructor(public readonly api: RestAPIProvider) {}

    get client() {
        return this.api.client;
    }
}

export default class RestAPIProvider implements DataProvider {
    client = axios.create({
        baseURL: "http://localhost:3333"
    });

    courses = new class CoursesAPI extends APICategory {
        async all(): Promise<Course[]> {
            const { data: { courses } } = await this.client.get<{
                courses: Course[]
            }>("/courses");

            return courses;
        }
    }(this)

    grades = new class GradesAPI extends APICategory {
        async all(): Promise<GradeMapping> {
            const { data: { grades } } = await this.client.get<{ grades: GradeMapping }>("/grades");

            return grades;
        }
    }(this)
    
    stream = new class StreamAPI extends APICategory {
        async allEntries(): Promise<StreamEntry[]> {
            const { data: { entries } } = await this.client.get<{
                entries: StreamEntry[]
            }>("/stream-entries");

            return entries;
        }
    }(this)
}