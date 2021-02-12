export interface NotificationDetails {
    actorId: number;
    announcementBody: string | null;
    announcementFirstName: string | null;
    announcementLastName: string | null;
    announcementLinkLabel: string | null;
    announcementTitle: string | null;
    announcementUrl: string | null;
    courseId: string;
    courseLink: string | null;
    notificationIds: string[];
    recipientType: string;
    seen: boolean;
    sourceId: string;
    sourceType: string;
    dueDate: string | null;
}

export interface ContentDetails {
    contentHandler: string;
    isBbPage: boolean;
    isFolder: boolean;
}

export interface EntryData {
    title: string | null;
    contentDetails: ContentDetails;
    contentExtract: string | null;
    coreId: string | null;
    courseContentId: string;
    groupId: string | null;
    isYours: boolean;
    notificationDetails: NotificationDetails;
}

export interface StreamEntry {
    itemSpecificData: EntryData;
    providerId: string;
    se_bottomContext: string;
    se_context: string;
    se_courseId: string;
    se_details: string;
    se_id: string;
    se_itemUri: string;
    se_participated: boolean;
    se_timestamp: number;
    se_userId: string | null;
    extraAttribs: Record<string, unknown>;
}

export interface StreamProvider {
    sp_newest: number;
    sp_oldest: number;
    sp_provider: string;
    sp_refreshDate: number;
}

export interface StreamCourseEntry {
    courseViewOption: string;
    externalAccessUrl: string;
    homePageUrl: string;
    id: string;
    isOrganization: boolean;
    name: string;
    ultraStatus: string;
}

export interface StreamProviderExtras {
    sx_courses: StreamCourseEntry[];
    sx_filter_links: never[];
    sx_filers: never[];
    sx_users: never[];
}

export interface StreamQuery {
    flushCache: boolean;
    forOverview: boolean;
    providers: Record<string, StreamProvider>;
    retrieveOnly: boolean;
}

export interface StreamRefreshResult {
    sv_autoDisplayGracePeriodSeconds: number;
    sv_deletedIds: never[];
    sv_extras: StreamProviderExtras;
    sv_moreData: boolean;
    sv_now: number;
    sv_providers: StreamProvider[];
    sv_streamEntries: StreamEntry[];
}