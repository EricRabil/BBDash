import { ContentCategories } from "@bbdash/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { PropsWithoutRef, useContext } from "react";
import { ColumnSettingsContext } from "../../contexts/column-settings-context";
import { DataSource, DataSourceSpecs } from "../../transformers/data-source-spec";
import { ENTRY_CONTENT_CATEGORY, ENTRY_EMPTY } from "../../transformers/spec";
import { PossibleSortOrders, SortOrder } from "../../utils/data-presentation";
import { categoryNames } from "../../utils/identifier-names";
import BBTooltip from "../BBTooltip";
import BBModal, { useModal } from "../modals/BBModal";
import { SettingsListField } from "../SettingsField";

const ALL_CATEGORIES: Array<keyof typeof ContentCategories> = Object.keys(ContentCategories) as unknown as Array<keyof typeof ContentCategories>;

/**
 * Controls the presentation of column-specific preferences
 * @param options the options for the column – specifically, the data source. Data source is used to determine which settings to show
 * @returns React element
 */
export default function DataColumnPreferences({ dataSource }: PropsWithoutRef<{ dataSource: DataSource }>) {
    const [ isShowing, toggleShowing ] = useModal();
    const { settings: { filters, sortBy, sortOrder, name }, deleteColumn, setKey } = useContext(ColumnSettingsContext);
    const { sortables, filterables } = DataSourceSpecs[dataSource];

    return (
        <>
            <BBTooltip content={<span>Configure Column</span>}>
                <span className="column-prefs-toggle" onClick={toggleShowing}>
                    <FontAwesomeIcon icon="cog" />
                </span>
            </BBTooltip>

            <BBModal isShowing={isShowing} toggleShowing={toggleShowing} className="settings-cell" footer={
                <div className="modal-btn btn-danger" onClick={deleteColumn}>Delete</div>
            }>
                <form onSubmit={e => {
                    e.preventDefault();
                    toggleShowing();
                    return false;
                }}>
                    <label className="input-group">
                        <span className="input-header">Column Name</span>

                        <input type="text" placeholder="Column Name" value={name} onChange={event => setKey("name", event.currentTarget.value)} />
                    </label>
                    {sortables?.length ? (
                        <>
                            <SettingsListField multi={false} options={sortables} value={sortBy || null} setValue={newValue => setKey("sortBy", newValue)} header={<>Sort By</>} />
                            <SettingsListField multi={false} options={PossibleSortOrders} value={sortOrder || SortOrder.descending} setValue={newValue => setKey("sortOrder", newValue)} header={<>Sort Mode</>} />
                        </>
                    ) : null}
                    {filterables?.length ? (
                        filterables.map(filterType => {
                            switch (filterType) {
                            case "ENTRY_CONTENT_CATEGORY":
                                return (
                                    <SettingsListField<keyof typeof ContentCategories, true> multi={true} key={filterType} options={ALL_CATEGORIES} value={(filters?.ENTRY_CONTENT_CATEGORY || []) as unknown as Array<keyof typeof ContentCategories>} setValue={newValue => setKey("filters", {
                                        [ENTRY_CONTENT_CATEGORY]: newValue,
                                        [ENTRY_EMPTY]: filters?.ENTRY_EMPTY
                                    })} header={<>Content Categories</>}>
                                        {type => <>{categoryNames[type] as string}</>}
                                    </SettingsListField>
                                );
                            }
                        })
                    ) : null}
                </form>
            </BBModal>
        </>
    );
}