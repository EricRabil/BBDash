import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import React, { PropsWithChildren, PropsWithoutRef, ReactNode, useLayoutEffect, useState } from "react";
import { useMergePreferences } from "../composables/useDefaultPreferences";
import ColumnCell from "./ColumnCell";

export interface BasePreferences {
    name: string;
}

export interface ColumnOptions<Preferences extends BasePreferences> extends PropsWithoutRef<{}> {
    name?: string;
    updatePreferences: (preferences: Preferences) => void;
    preferences: Preferences;
    remove: Function;
}

/**
 * Higher-order component that provides a suite of common functions for columns, includes preferences APIs and standard layout
 * @param props column options
 */
export default function Column<Preferences extends BasePreferences>(props: PropsWithChildren<{
    header?: ReactNode;
    settings?: ReactNode;
    className?: string;
} & ColumnOptions<Preferences>>) {
    // whether the settings drawer is open
    const [showingSettings, setShowingSettings] = useState(false);
    // whether we are currently transitioning
    const [transitioning, setTransitioning] = useState(false);
    // reference to the settings drawer container element
    const [settingsCell, setSettingsCell] = useState(null as HTMLDivElement | null);
    // manages the height of the settings drawer, for determining if it is open or closed
    const [settingsHeight, setSettingsHeight] = useState(0);

    const { children, className, settings, remove, updatePreferences, ...divProps } = props;

    useLayoutEffect(() => {
        setSettingsHeight(showingSettings ? Array.from(settingsCell?.children || []).reduce((a,c) => a + c.clientHeight, 0) : 0);
    }, [showingSettings]);

    useLayoutEffect(() => {
        setTransitioning(true);
    }, [settingsHeight]);

    const merge = useMergePreferences(props);

    return (
        <div className={classnames("column-container", className)} {...divProps}>
            <div className="column-drag-handle" />

            <div className="column-header">
                <div className="column-header--main">
                    {props.preferences.name}
                </div>

                <span className="column-prefs-toggle" onClick={() => {
                    setShowingSettings(!showingSettings);
                }}>
                    <FontAwesomeIcon icon="cog" />
                </span>
            </div>

            <div className="column-body">
                <ColumnCell className="settings-cell" style={{
                    height: `${settingsHeight}px`,
                    display: (showingSettings || transitioning) ? undefined : "none"
                }} rootRef={setSettingsCell} onTransitionEnd={() => setTransitioning(false)}>
                    <div className="settings-cell-body">
                        {settings}

                        <label className="column-settings-field--single">
                            <span className="column-settings-field--header">Column Name</span>
                            
                            <input type="text" placeholder="Column Name" value={props.preferences.name} onChange={event => merge({ name: event.currentTarget.value } as any)} />
                        </label>
                    </div>
                    <div className="settings-cell-footer">
                        <div className="settings-cell-footer--action danger" onClick={() => remove()}>
                            <FontAwesomeIcon icon="trash" />
                        </div>
                    </div>
                </ColumnCell>
                {children}
            </div>
        </div>
    );
}