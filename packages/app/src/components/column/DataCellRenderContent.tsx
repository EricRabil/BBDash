import classNames from "classnames";
import React, { DetailedHTMLProps, HTMLAttributes, useMemo } from "react";
import { AnyRenderContent, RenderContentFormat } from "../../transformers/spec";

/**
 * Renders a node of render content within a DataCellData tree.
 */
export default function DataCellRenderContent({ content, className, tag: Tag = "div", ...props }: { content: AnyRenderContent, tag?: keyof JSX.IntrinsicElements } & DetailedHTMLProps<HTMLAttributes<unknown>, unknown>) {
    if (!content) return null;

    if (typeof content === "string") content = { format: RenderContentFormat.text, data: content };

    // Tag is overridden to a if a link is present.
    if (content.link) Tag = "a";

    const baseProps = {
        className: classNames(className, content.className),
        ref: content.ref
    };

    const extraProps = useMemo(() => content?.link ? {
        href: content.link,
        target: "_blank",
        rel: "noreferrer"
    } : {}, [content.link]);

    switch (content.format) {
    case RenderContentFormat.html:
        return (
            <Tag {...props as any} {...extraProps} {...baseProps} dangerouslySetInnerHTML={{
                __html: content.data
            }} />
        );
    case RenderContentFormat.text:
        return (
            <Tag {...props as any} {...extraProps} {...baseProps}>{content.data}</Tag>
        );
    }
}