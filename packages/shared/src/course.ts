import { Term } from "./scheduling";

export interface Course {
    batchUid: string;
    classificationId: string;
    courseId: string;
    courseViewOption: string;
    createdDate: string;
    dataSourceId: string;
    defaultViewContent: string;
    description: string;
    displayId: string;
    displayName: string;
    durationType: string;
    effectiveAvailability: boolean;
    endDate: string;
    enrollmentType: string;
    externalAccessUrl: string;
    homePageUrl: string;
    id: string;
    isAllowGuests: boolean;
    isAllowObservers: boolean;
    isAvailable: boolean;
    isClosed: boolean;
    isHonorTermAvailability: boolean;
    isLocaleEnforced: boolean;
    isOrganization: boolean;
    modifiedDate: string;
    name: string;
    navStyle: string;
    paceType: string;
    startDate: string;
    term: Term;
    termId: string;
    ultraStatus: string;
    uuid: string;
}

export interface CourseContentItem {
    body: string;
    contentHandler: {
        id: string;
        discussionId: string;
    };
    id: string;
    links: Array<{
        href: string;
        rel: string;
        title: string;
        type: string;
    }>;
    position: number;
    title: string;
}

export interface CourseEnrollment {
    childCourseId: string | null;
    course: Course;
    courseCardColorIndex: number;
    courseId: string;
    dataSourceId: string;
    dueDateExceptionType: string;
    enrollmentDate: string;
    id: string;
    includedInRoster: boolean;
    isAvailable: boolean;
    lastAccessDate: string;
    modifiedDate: string;
    receiveEmail: boolean;
    role: string;
    timeLimitExceptionType: string;
    userHasHidden: boolean;
    userId: string;
}