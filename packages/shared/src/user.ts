export interface User {
    avatar?: {
        viewUrl: string;
        source?: string;
    };
    contact?: {
        email?: string;
    };
    id: string;
    institutionRoleIds: string[];
    modified: string;
    name: {
        given?: string;
        family?: string;
        middle?: string;
    };
    studentId: string;
    systemRoleIds: string[];
    userName: string;
}