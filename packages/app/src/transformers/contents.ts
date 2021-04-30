import { Course } from "@bbdash/shared";
import { TransformationOptions } from ".";
import { BBURI } from "../utils/uri";
import { TaggedCourseContentItem } from "./data-source-spec";
import { DataCellData, ENTRY_CONTENT_CATEGORY, ENTRY_TIME, ENTRY_TITLE, RenderContentFormat } from "./spec";
import { formatDate } from "./util";

const origins = new Map<string, string>();

function formatURL(path: string, course: Course): string {
    const origin = origins.get(course.id) || origins.set(course.id, new URL(course.externalAccessUrl).origin).get(course.id) as string;
    return `${origin}${path[0] === "/" ? "" : "/"}${path}`;
}

function makeLinkForContent(content: TaggedCourseContentItem, course: Course): string | null {
    const [ link ] = content.links || [];

    if (!link?.href) return null;
    else return formatURL(link.href, course);
}

/**
 * Takes raw content HTML and adapts its nodes to integrate well with our layout/virtual scrolling. Returns a ready-to-mount HTML node
 * @param html raw HTML
 * @param formatURL url formatter
 */
function transformBodyHTML(html: string, formatURL: (url: string) => string, transformationCache: Record<string, Node[]>): Node[] {
    if (transformationCache[html]) return transformationCache[html];
    console.log("miss");

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

    const children = Array.from(root.childNodes);
    children.forEach(c => root.removeChild(c));

    return transformationCache[html] = children;
}

export default function transformCourseContents(contents: TaggedCourseContentItem[], { courses, renderCache }: TransformationOptions) {
    const data: DataCellData[] = [];

    for (const content of contents) {
        const course = courses[content.courseID];
        const date = formatDate(content.modified || content.created);
        const link = makeLinkForContent(content, course);

        data.push({
            header: {
                title: {
                    format: RenderContentFormat.html,
                    data: content.title,
                    link
                },
                sideTitle: {
                    format: RenderContentFormat.html,
                    data: date,
                    tag: "time",
                    elProps: {
                        dateTime: content.modified || content.created
                    }
                }
            },
            subtitle: course.displayName,
            description: content.body ? {
                format: RenderContentFormat.html,
                ref: element => {
                    if (!element?.isConnected) return;
                    const toMount = transformBodyHTML(content.body, url => formatURL(url, course), renderCache);
                    element.append(...toMount);
                },
                className: "course-contents--compatibility-mode"
            } : null,
            attributes: {
                courseID: content.courseID,
                uri: BBURI.fromCourseContentItem(content).toString()
            },
            sortables: {
                [ENTRY_TIME]: content.modified || content.created,
                [ENTRY_TITLE]: content.title
            },
            filterables: {
                [ENTRY_CONTENT_CATEGORY]: content.contentHandler?.id
            }
        });
    }

    return data;
}