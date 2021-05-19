import { BBPresentationController } from "./content-src/BBPresentationController";
import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { render } from "react-dom";
import "./content.scss";
import "./content-src/fontawesome";

function useChangeEffect(cb: () => void | (() => void), deps: any[]) {
    const didRunOnce = useRef(false);

    useEffect(() => {
        if (didRunOnce.current) {
            return cb();
        }

        didRunOnce.current = true;
    }, deps);
}

function BBTrigger() {
    const [ open, setOpen ] = useState(false);

    useChangeEffect(() => {
        BBPresentationController.toggle(open);
        console.log(`Open: ${open}`);
    }, [open]);

    return (
        <label className="bbdash-trigger" attr-checked={open ? "checked" : null}>
            <input type="checkbox" checked={open} onChange={ev => {
                setOpen(ev.target.checked);
            }} />
            <FontAwesomeIcon icon="columns" />
            <span>BBDash</span>
        </label>
    )
}

const root = document.createElement("div");
root.className = "bbdash-trigger-root";

document.body.appendChild(root);
render(<BBTrigger />, root);

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