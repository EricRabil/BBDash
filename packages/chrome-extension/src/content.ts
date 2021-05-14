import { BBPresentationController } from "./content-src/BBPresentationController";

function createTrigger(id?: string): HTMLButtonElement {
    const button = document.createElement("button");
    if (id) button.id = id;
    button.style.position = "absolute";
    button.style.top = "0";
    button.style.right = "0";
    button.style.marginRight = "10px";
    button.style.marginTop = "10px";
    button.style.padding = "10px 5px";
    button.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
    button.style.border = "1px solid rgba(0, 0, 0, 0.8)";
    button.style.borderRadius = "5px";
    button.style.zIndex = "1000001",

    button.textContent = "BBDash";

    return button;
}

const trigger = createTrigger("bbdash-trigger");
trigger.addEventListener("click", () => {
    BBPresentationController.toggle();
});

document.body.appendChild(trigger);

function runInBrowserContext(fn: Function) {
    const script = document.createElement("script");
    script.innerText = `(${fn.toString()})()`;
    document.body.appendChild(script);
}

runInBrowserContext(function() {
    const meta = document.createElement("meta");
    meta.name = "initial-context";
    meta.id = "initial-context";
    meta.content = JSON.stringify(window.__initialContext);
    document.head.appendChild(meta);
});

const meta: HTMLMetaElement = document.getElementById("initial-context") as HTMLMetaElement;
window.__initialContext = JSON.parse(meta.content);