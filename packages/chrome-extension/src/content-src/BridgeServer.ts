import { BlackboardAPI } from "@bbdash/bb-api";
import { AnyBridgePayload, BridgeObjectsType, BridgeObjectsTypeMapping, BridgePayload, BridgePayloadType, BridgeServer, User } from "@bbdash/shared";

declare global {
    interface Window {
        __initialContext: {
            user: User;
        }
    }
}

const client = new BlackboardAPI({
    inProcess: true,
    instanceURL: "https://learn.dcollege.net",
    delegate: {
        xsrfInvalidated: async () => {

        },
        relogin: async () => {

        },
        userID: () => window.__initialContext.user.id,
        userChanged: async () => {
            
        }
    }
})

async function dataForRequestType<Type extends BridgeObjectsType>(type: Type): Promise<BridgeObjectsTypeMapping[Type]> {
    switch (type) {
        case BridgeObjectsType.contents:
            return await client.courses.allContents(true) as BridgeObjectsTypeMapping[Type];
        case BridgeObjectsType.courses:
            return await client.courses.all() as BridgeObjectsTypeMapping[Type]
        case BridgeObjectsType.grades:
            return await client.grades.all(true) as BridgeObjectsTypeMapping[Type]
        case BridgeObjectsType.streamEntries:
            return await client.stream.allEntries() as BridgeObjectsTypeMapping[Type]
        case BridgeObjectsType.all:
            const [
                contents,
                courses,
                grades,
                streamEntries
            ] = await Promise.all([
                dataForRequestType(BridgeObjectsType.contents),
                dataForRequestType(BridgeObjectsType.courses),
                dataForRequestType(BridgeObjectsType.grades),
                dataForRequestType(BridgeObjectsType.streamEntries)
            ]);

            return {
                contents,
                courses,
                grades,
                streamEntries
            } as BridgeObjectsTypeMapping[Type];
        default:
            throw new Error("Invalid bridge object type " + type);
    }
}

export const HostBridgeServer = new class HostBridgeServer extends BridgeServer {
    handlePayload(payload: AnyBridgePayload, sender: Window) {
        if (super.handlePayload(payload, sender)) return true;
        
        switch (payload.type) {
            case BridgePayloadType.request:
                (async () => {
                    BridgePayload.send({
                        type: BridgePayloadType.response,
                        objectsType: payload.objectsType,
                        objects: await dataForRequestType(payload.objectsType) as any
                    }, sender);
                })();

                return true;
        }

        return false;
    }
}

export default HostBridgeServer;