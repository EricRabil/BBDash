declare module "tough-cookie-web-storage-store" {
    import { Store } from "tough-cookie";

    export default class WebStorageCookieStore extends Store {
        constructor(storage: Storage)
    }
}