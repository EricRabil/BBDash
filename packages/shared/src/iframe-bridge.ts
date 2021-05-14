import { StreamEntry } from "./activity";
import { Course, CourseContentItem } from "./course";
import { GradeMapping } from "./grades";

export enum BridgePayloadType {
    ping = "ping",
    pong = "pong",
    request = "request",
    response = "response"
}

export enum BridgeObjectsType {
    courses = "courses",
    grades = "grades",
    contents = "contents",
    streamEntries = "streamEntries",
    all = "all"
}

export interface BridgePayload<Type extends BridgePayloadType> {
    type: Type;
}

export interface BridgeRequestPayload extends BridgePayload<BridgePayloadType.request> {
    objectsType: BridgeObjectsType;
}

export type BridgeObjectsTypeMapping = {
    [BridgeObjectsType.courses]: Course[];
    [BridgeObjectsType.contents]: Record<string, CourseContentItem[]>;
    [BridgeObjectsType.grades]: GradeMapping;
    [BridgeObjectsType.streamEntries]: StreamEntry[];
    [BridgeObjectsType.all]: {
        [BridgeObjectsType.courses]: Course[];
        [BridgeObjectsType.contents]: Record<string, CourseContentItem[]>;
        [BridgeObjectsType.grades]: GradeMapping;
        [BridgeObjectsType.streamEntries]: StreamEntry[];
    }
}

export interface BridgeResponsePayload<Type extends BridgeObjectsType> extends BridgePayload<BridgePayloadType.response> {
    objectsType: Type;
    objects: BridgeObjectsTypeMapping[Type];
}

type SynthesizedEveryType = {
    [K in keyof BridgeObjectsTypeMapping]: BridgeResponsePayload<K>;
}

export type AnyBridgeResponsePayload = SynthesizedEveryType[keyof SynthesizedEveryType];

export namespace BridgePayload {
    export function send(payload: AnyBridgePayload, receiver: Window) {
        receiver.postMessage(serialize(payload), "*");
    }

    export function serialize(payload: AnyBridgePayload): string {
        return JSON.stringify(payload);
    }

    export function deserialize(raw: string): AnyBridgePayload | null {
        try {
            const parsed = JSON.parse(raw);
            if (!isBridgePayload(parsed)) return null;
            return parsed;
        } catch {
            return null;
        }
    }
}

export type PingBridgePayload = BridgePayload<BridgePayloadType.ping>;
export type PongBridgePayload = BridgePayload<BridgePayloadType.pong>;

export interface BridgePayloadBindings {
    [BridgePayloadType.ping]: PingBridgePayload,
    [BridgePayloadType.pong]: PongBridgePayload,
    [BridgePayloadType.request]: BridgeRequestPayload,
    [BridgePayloadType.response]: AnyBridgeResponsePayload
}

export type AnyBridgePayload = BridgePayloadBindings[keyof BridgePayloadBindings];

export function isBridgePayload(payload: any): payload is AnyBridgePayload {
    return typeof payload === "object"
        && payload !== null
        && "type" in payload
        && typeof payload.type === "string";    
}

const PONG: PongBridgePayload = { type: BridgePayloadType.pong };

export class BridgeServer {
    handlePayload(payload: AnyBridgePayload, sender: Window): boolean {
        const reply = (payload: AnyBridgePayload) => BridgePayload.send(payload, sender);

        switch (payload.type) {
            case BridgePayloadType.ping:
                reply(PONG);
                return true;
            default:
                return false;
        }
    }
}