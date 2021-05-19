import { AnyBridgePayload, BridgePayload } from "@bbdash/shared";
import BridgeServer from "./BridgeServer";

function applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
    for (const key in styles) {
        element.style[key] = styles[key]!;
    }
}

function createBBDashHost(callback: (message: AnyBridgePayload, sender: Window) => void) {
    const frame = document.createElement("iframe");
    frame.src = chrome.extension.getURL("index.html");
    frame.id = "bbdash-host";

    window.addEventListener("message", message => {
        if (message.source !== frame.contentWindow) {
            // Not our frame, exit
            return;
        }

        const payload = BridgePayload.deserialize(message.data.toString());
        if (!payload) {
            // invalid request, exit
            return;
        }

        callback(payload, frame.contentWindow!);
    });

    document.body.appendChild(frame);

    return frame;
}

const requestSingleAnimationFrame = (function requestSingleAnimationFrame() {
    let pending: number | null = null;
    let abortLast: (() => void) | null = null;

    return (cb: () => void, abort: (() => void) | null = null) => {
        if (pending !== null) {
            abortLast?.();
            cancelAnimationFrame(pending);
        }

        abortLast = abort;
        pending = requestAnimationFrame(() => {
            cb();
            pending = null;
        });
    };
})();

export const BBPresentationController = new class BBPresentationController {
    #showing = false;
    #host: HTMLIFrameElement = createBBDashHost((payload, window) => BridgeServer.handlePayload(payload, window));

    toggle(state = !this.showing) {
        this.showing = state;
    }

    get showing() {
        return this.#showing;
    }

    set showing(showing: boolean) {
        this.#showing = showing;

        if (showing) {
            this.#host.style.animationName = "bbdash-enter";
        } else if (!showing && this.#host.isConnected) {
            this.#host.style.animationName = "bbdash-leave";
        }
    }
}