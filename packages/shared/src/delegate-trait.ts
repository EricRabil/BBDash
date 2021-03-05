import { BBLog } from "./logging";

const Log = BBLog("DelegateTrait");

type ExtractParameters<T> = T extends (arg0: infer U) => any ? U : never;

export abstract class DelegateTrait<Delegate> {
    public abstract delegate: Delegate;

    protected async maybeFire<K extends keyof Delegate>(key: K, arg0: ExtractParameters<NonNullable<Delegate[K]>>) {
        Log.debug("Maybe firing to delegate with key %s and data", key, arg0);
        if (this.delegate[key] && typeof this.delegate[key] === "function") await (this.delegate[key] as unknown as Function)(arg0);
    }
}