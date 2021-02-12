import { AssetDescription } from "./foundation";

export interface GradebookEntryMetadata {
    isOverride: boolean;
    requiresSchemaKnowledgeToDisplay: boolean;
    score?: number;
}

export enum GradebookStatus {
    GRADED = "GRADED",
    NEEDS_GRADING = "NEEDS_GRADING"
}

export enum ManualStatus {
    NO_OVERRIDE = "NO_OVERRIDE"
}

export interface GradebookEntry {
    averageScore: number;
    columnId: string;
    columnUrl: string;
    courseId: string;
    displayGrade: GradebookEntryMetadata;
    gradeScoreDesignation: string;
    id: string | null;
    instructorFeedback: AssetDescription;
    isCalculatedColumnGrade: boolean;
    isCorrupt: boolean;
    isExempt: boolean;
    manualGrade: never | null;
    manualScore: number | null;
    manualStatus?: ManualStatus;
    pointsPossible: number;
    userId: string;
    version: number;
    status?: GradebookStatus;
}

export interface GradeMapping {
    [courseID: string]: GradebookEntry[];
}