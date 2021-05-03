import React from "react";
import { PreferenceConsumer } from "../../contexts/column-settings-context";

export default function DataColumnStyleInjector({ children }: { children: JSX.Element }): JSX.Element {
    return (
        <PreferenceConsumer preferenceKey="headerColor">
            {([ headerColor ]) => (
                React.cloneElement(children, {
                    style: Object.assign({}, children.props.style || {}, typeof headerColor === "number" ? {
                        "--column-background-color": `var(--palette-background-secondary-color-${headerColor})`,
                        color: `var(--palette-text-secondary-color-${headerColor})`
                    } as any : {})
                })
            )}
        </PreferenceConsumer>
    );
}