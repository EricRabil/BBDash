import { DelegateTrait } from "@bbdash/shared";
import { Disconnectable } from "./listener-lifecycles";

export interface ControlsObject<Delegate> extends DelegateTrait<Delegate>, Disconnectable {
    /**
     * Deletes the existing object.
     */
    close(): Promise<void>;

    /**
     * Opens a new object.
     */
    open(): Promise<void>;

    /**
     * Whether the object exists or is being created.
     */
    exists: boolean;
}