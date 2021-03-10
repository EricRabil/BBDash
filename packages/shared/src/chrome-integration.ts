export interface IntegrationAPI {
    auth: {
        relogin(): Promise<void>;
        loggedOut(): Promise<boolean>;
        onIsLoggedOut(cb: () => any): Promise<void>;
        confirmRelogin(): Promise<void>;
        rejectRelogin(): Promise<void>;
    }
}