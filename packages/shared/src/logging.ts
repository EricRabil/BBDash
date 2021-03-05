import { ConsoleFormattedStream, createLogger } from "browser-bunyan";

const shared_stream = new ConsoleFormattedStream();

export type Logger = ReturnType<typeof createLogger>;

export function BBLog(namespace: string): Logger {
    return createLogger({
        stream: shared_stream,
        name: namespace,
        level: "debug"
    })
}

export const RootLog: Logger = BBLog("BBDash");