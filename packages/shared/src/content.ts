export enum ContentType {
    folder = "resource/x-bb-folder",
    document = "resource/x-bb-document",
    courseLink = "resource/x-bb-courselink",
    scorm = "resource/x-plugin-scormengine",
    externalLink = "resource/x-bb-externallink",
    file = "resource/x-bb-file",
    video = "resource/x-bb-video",
    assignment = "resource/x-bb-assignment",
    kalturaMashup = "resource/x-osv-kaltura/mashup",
    tool = "resource/x-bb-toollink",
    forum = "resource/x-bb-forumlink",
    assessment = "resource/x-bb-asmt-test-link",
    blank = "resource/x-bb-blankpage",
    ares = "resource/x-bb-bltiplacement-ARES",
    group = "resource/x-bb-grouplink",
    turnItIn = "resource/x-turnitintool-assignment",
    libGuides = "resource/x-bb-bltiplacement-LibGuides"
}

export const ContentCategories = {
    assignment: [ContentType.assessment, ContentType.assignment, ContentType.turnItIn],
    discussionBoard: [ContentType.forum],
    group: [ContentType.group],
    lti: [ContentType.ares, ContentType.libGuides],
    tools: [ContentType.tool],
    info: [ContentType.document, ContentType.file, ContentType.video, ContentType.kalturaMashup, ContentType.externalLink],
    organization: [ContentType.folder],
    navigation: [ContentType.courseLink],
    unknown: [ContentType.blank]
}

export type LTIPlacement = {
    placementHandle: string;
};

export interface BaseContentHandler<T extends ContentType> {
    id: T;
}

export type FolderContentHandler = BaseContentHandler<ContentType.folder>

export type DocumentContentHandler = BaseContentHandler<ContentType.document>

export interface CourseLinkContentHandler extends BaseContentHandler<ContentType.courseLink> {
    targetId: string;
    targetType: string;
}

export type ScormContentHandler = BaseContentHandler<ContentType.scorm>

export interface ExternalLinkContentHandler extends BaseContentHandler<ContentType.externalLink> {
    url: string;
}

export interface FileContentHandler extends BaseContentHandler<ContentType.file> {
    file: {
        fileName: string;
    }
}

export interface AssignmentContentHandler extends BaseContentHandler<ContentType.assignment> {
    gradeColumnId: string;
    groupContent: boolean;

}

export type KalturaMashupContentHandler = BaseContentHandler<ContentType.kalturaMashup>

export type ToolContentHandler = BaseContentHandler<ContentType.tool>

export interface ForumContentHandler extends BaseContentHandler<ContentType.forum> {
    discussionId: string;
}

export interface AssessmentContentHandler extends BaseContentHandler<ContentType.assessment> {
    assessmentId: string;
    gradeColumnId: string;
    proctoring: {
        secureBrowserRequiredToReview: boolean;
        secureBrowserRequiredToTake: boolean;
        webcamRequired: boolean;
    };
}

export type BlankContentHandler = BaseContentHandler<ContentType.blank>

export type ARESLTIPlacementContentHandler = LTIPlacement & BaseContentHandler<ContentType.ares>

export type GroupContentHandler = BaseContentHandler<ContentType.group>

export type TurnItInContentHandler = BaseContentHandler<ContentType.turnItIn>

export type LibGuidesLTIPlacementContentHandler = LTIPlacement & BaseContentHandler<ContentType.libGuides>

export type ContentHandler = FolderContentHandler | DocumentContentHandler | CourseLinkContentHandler | ScormContentHandler | ExternalLinkContentHandler | FileContentHandler | AssignmentContentHandler | KalturaMashupContentHandler | ToolContentHandler | ForumContentHandler | AssessmentContentHandler | BlankContentHandler | ARESLTIPlacementContentHandler | GroupContentHandler | TurnItInContentHandler | LibGuidesLTIPlacementContentHandler;