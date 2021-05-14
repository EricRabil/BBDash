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

    applyStyles(frame, {
        position: "absolute",
        top: "0",
        right: "0",
        width: "calc(100vw - 200px)",
        height: "100vh",
        zIndex: "1000000",
        border: "0",
        transition: "transform 200ms ease-in",
        transform: "translateX(100vw)",
        backgroundColor: "rgba(0, 0, 0, 0.3)"
    });

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

export const BBPresentationController = new class BBPresentationController {
    #showing = false;
    #host: HTMLIFrameElement = createBBDashHost((payload, window) => BridgeServer.handlePayload(payload, window));

    toggle(state = !this.showing) {
        this.showing = state;
    }

    get showing() {
        return this.#showing;
    }

    #processing = false;
    set showing(showing: boolean) {
        if (this.#processing) return;
        this.#processing = true;
        this.#showing = showing;

        if (showing) {
            requestAnimationFrame(() => {
                this.#host.style.transform = "translateX(0)"
                this.#processing = false;
            });
        } else if (!showing && this.#host.isConnected) {
            requestAnimationFrame(() => {
                this.#host.style.transform = "translateX(100vw)";
            });

            this.#host.ontransitionend = () => {
                this.#processing = false;
                this.#host.ontransitionend = null;
            }
        } else {
            this.#processing = false;
        }
    }
}