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

export default function Column<Preferences extends BasePreferences>(props: PropsWithChildren<{
    header?: ReactNode;
    settings?: ReactNode;
    className?: string;
} & ColumnOptions<Preferences>>) {
    const [showingSettings, setShowingSettings] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [settingsCell, setSettingsCell] = useState(null as HTMLDivElement | null);
    const [settingsHeight, setSettingsHeight] = useState(0);

    const { children, className, settings, remove, ...divProps } = props;

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

                <span className="column-prefs-toggle" onClick={() => setShowingSettings(!showingSettings)}>
                    <FontAwesomeIcon icon="cog" />
                </span>
            </div>

            <div className="column-body">
                <ColumnCell className="settings-cell" style={{
                    height: `${settingsHeight}px`,
                    display: (showingSettings || transitioning) ? undefined : "none"
                }} rootRef={setSettingsCell} onTransitionEnd={() => {
                    setTransitioning(false);
                }}>
                    <div className="settings-cell-body">
                        {settings}

                        <label>
                            Column Name
                            
                            <input type="text" value={props.preferences.name} onChange={event => merge({ name: event.currentTarget.value } as any)} />
                        </label>
                    </div>
                    <div className="settings-cell-footer">
                        <div className="settings-cell-footer--action danger" onClick={() => remove()}>
                            <FontAwesomeIcon icon="trash" />
                            Delete
                        </div>
                    </div>
                </ColumnCell>
                {children}
            </div>
        </div>
    );
}