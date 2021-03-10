import { Course, CourseContentItem } from "@bbdash/shared";
import { DateTime } from "luxon";
import React from "react";
import ColumnCell from "../components/ColumnCell";

export interface CourseContentCellProps {
    course: Course;
    content: CourseContentItem;
    style?: React.CSSProperties;
    rootRef?: (elm: Element) => void;
    measure?: () => void;
}

interface CourseContentState {
    body: Element | null;
    rawHTML: string | undefined;
}

declare global {
    interface Window {
        courseContentResizeHooks: {
            [key: string]: () => void;
        }
    }
}

/**
 * Takes raw content HTML and adapts its nodes to integrate well with our layout/virtual scrolling. Returns a ready-to-mount HTML node
 * @param html raw HTML
 * @param formatURL url formatter
 * @param resized callback for element resizing
 */
function transformBodyHTML(html: string, formatURL: (url: string) => string, resized: () => void): Element {
    const root = document.createElement("div");
    root.innerHTML = html;

    /**
     * Copies a set of attributes from a source element to a destination element
     * @param src element to copy attributes from
     * @param dest element to copy attributes to
     * @param extraAttribs attributes beyond height and width to transfer
     */
    function copyAttributes(src: Element, dest: Element, extraAttribs: string[] = []) {
        for (const attr of ["height", "width", ...extraAttribs]) {
            const value = src.getAttribute(attr);
            if (value) dest.setAttribute(attr, value);
        }
    }

    let src: string | null;

    root.querySelectorAll("a, video, img, iframe, embed[type=\"video/mpeg\"], p").forEach(element => {
        switch (element.tagName) {
        case "P":
            // eslint-disable-next-line
            if (Array.prototype.every.call(element.children, c => c.tagName === "BR")) element.remove();
            else {
                Array.prototype.forEach.call(element.children, c => {
                    switch (c.tagName) {
                    case "BR":
                        if (c.nextSibling instanceof HTMLBRElement || c.nextSibling instanceof Text && c.nextSibling.textContent === "\xa0") {
                            c.remove();
                        }
                        break;
                    }
                });
            }
            break;
        // transforms video embeds to lightweight HTML5 videos
        case "EMBED":
            // eslint-disable-next-line
            src = element.getAttribute("src");
            if (src) {
                const video = document.createElement("video");
                video.src = src;
                video.controls = true;
                copyAttributes(element, video);
                element.replaceWith(video);
            }
            break;
        // ensures anchor elements open in a new tab
        case "A":
            (element as HTMLAnchorElement).target = "_blank";
            break;
        // trigger resize watchers on metadata load
        case "VIDEO":
            (element as HTMLVideoElement).onloadedmetadata = () => element.isConnected && resized();
            break;
        // trigger resize watchers on image load
        case "IMG":
            (element as HTMLImageElement).onload = () => element.isConnected && resized();
            break;
        case "IFRAME":
            (element as HTMLIFrameElement).marginHeight = "0";
            (element as HTMLIFrameElement).marginWidth = "0";

            // eslint-disable-next-line
            src = element.getAttribute("src");

            // redirect iframes to the blackboard origin, since they use relative urls
            if (src?.startsWith("/webapps")) (element as HTMLIFrameElement).src = formatURL(src);
            break;
        }
    });

    return root;
}

const origins = new Map<string, string>();

function formatURL(path: string, course: Course): string {
    const origin = origins.get(course.id) || origins.set(course.id, new URL(course.externalAccessUrl).origin).get(course.id) as string;
    return `${origin}${path[0] === "/" ? "" : "/"}${path}`;
}

/**
 * Displays one unit of course content
 */
export default class CourseContentCell extends React.Component<CourseContentCellProps, CourseContentState> {
    constructor(props: CourseContentCellProps) {
        super(props);

        this.state = {
            body: null,
            rawHTML: ""
        };
    }

    static getDerivedStateFromProps(props: CourseContentCellProps, state: CourseContentState): CourseContentState | null {
        if (props.content.body !== state.rawHTML && props.content.body) {
            // content body changed. recompute the body element
            return {
                rawHTML: props.content.body,
                body: transformBodyHTML(props.content.body, url => formatURL(url, props.course), props.measure || (() => undefined))
            };
        }
        return null;
    }

    /**
     * Computed date label for this cell
     */
    date() {
        const timeString = this.props.content.modified || this.props.content.created;

        if (!timeString) return null;
        else return DateTime.fromISO(timeString).toLocaleString(DateTime.DATE_SHORT);
    }

    formatURL(path: string) {
        return formatURL(path, this.props.course);
    }

    /**
     * Computed hyperlink for the title label
     */
    link() {
        const [ link ] = this.props.content.links || [];

        if (!link?.href) return null;
        else return this.formatURL(link.href);
    }

    render() {
        const date = this.date();
        const link = this.link();

        const HeaderTitle = link ? "a" : "div";

        return <ColumnCell className="data-cell" style={this.props.style} course={this.props.course}>
            <div className="data-cell--inner">
                <div className="data-cell--header">
                    <HeaderTitle href={link as string} target="_blank" className="data-cell--header-title">{this.props.content.title}</HeaderTitle>
                    {
                        date ? <div className="data-cell--muted">{date}</div> : null
                    }
                </div>
                <div className="data-cell--muted">{this.props.course.displayName}</div>
                <div className="data-cell--description course-contents--compatibility-mode" ref={element => element && this.state.body && this.state.body.childNodes && element.append(...this.state.body.childNodes)} />
            </div>
        </ColumnCell>;
    }
}