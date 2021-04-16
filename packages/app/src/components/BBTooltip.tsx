import Tippy, { TippyProps } from "@tippyjs/react";
import React, { PropsWithRef } from "react";

/**
 * Wraps Tippy.JS with our default preferences
 */
export default function BBTooltip({ content, children, duration = 100, placement = "bottom" }: PropsWithRef<{ content: TippyProps["content"], children?: React.ReactElement<any>, duration?: number, placement?: TippyProps["placement"] }>) {
    return (
        <Tippy content={content} duration={duration} placement={placement} className="bb-tooltip">
            {children}
        </Tippy>
    );
}