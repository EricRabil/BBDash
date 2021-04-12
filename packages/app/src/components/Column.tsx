import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import React, { PropsWithChildren, PropsWithoutRef, ReactNode, useLayoutEffect, useState } from "react";
import { useMergePreferences } from "../composables/useDefaultPreferences";
import BBModal from "./BBModal";
import BBTooltip from "./BBTooltip";
import { useModal } from "./Modal";

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

    const [ isShowingSettings, toggleIsShowingSettings ] = useModal();

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

                <BBTooltip content={<span>Configure Column</span>}>
                    <span className="column-prefs-toggle" onClick={toggleIsShowingSettings}>
                        <FontAwesomeIcon icon="cog" />
                    </span>
                </BBTooltip>
            </div>

            <div className="column-body">
                <BBModal isShowing={isShowingSettings} toggleShowing={toggleIsShowingSettings} className="settings-cell" footer={
                    <div className="modal-btn btn-danger" onClick={() => remove()}>
                        Delete
                    </div>
                }>
                    <form onSubmit={e => {
                        e.preventDefault();
                        toggleIsShowingSettings();
                        return false;
                    }}>
                        <label className="input-group">
                            <span className="input-header">Column Name</span>
                            
                            <input type="text" placeholder="Column Name" value={props.preferences.name} onChange={event => merge({ name: event.currentTarget.value } as any)} />
                        </label>

                        {settings}
                    </form>
                </BBModal>
                {children}
            </div>
        </div>
    );
}