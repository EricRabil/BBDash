import { User } from "@bbdash/shared";
import APILayer from "../structs/layer";
import { SharedThrottle } from "../util";

/**
 * API layer for interacting with user objects.
 */
export class UsersLayer extends APILayer {
    throttle = new SharedThrottle(1);

    /**
     * Returns information about the currently-authenticated user.
     */
    async me(): Promise<User> {
        const { data: user } = await this.throttle.processOne(() => this.axios.get<User>(this.api.formatURL("/learn/api/public/v1/users/me")));

        return user;
    }
}