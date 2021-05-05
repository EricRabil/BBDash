import { ContentCategories } from "@bbdash/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { PropsWithoutRef, useContext } from "react";
import { ColumnSettingsContext, PreferenceConsumer } from "../../contexts/column-settings-context";
import { ModalContextProvider } from "../../contexts/modal-context";
import { DataSource, DataSourceSpecs } from "../../transformers/data-source-spec";
import { ENTRY_CONTENT_CATEGORY } from "../../transformers/spec";
import { PossibleSortOrders, SortOrder } from "../../utils/data-presentation";
import { categoryNames } from "../../utils/identifier-names";
import BBTooltip from "../BBTooltip";
import BBModal from "../modals/BBModal";
import SettingsField, { SettingsListField } from "../SettingsField";

const ALL_CATEGORIES: Array<keyof typeof ContentCategories> = Object.keys(ContentCategories) as unknown as Array<keyof typeof ContentCategories>;

/**
 * Controls the presentation of column-specific preferences
 * @param options the options for the column – specifically, the data source. Data source is used to determine which settings to show
 * @returns React element
 */
export default function DataColumnPreferences({ dataSource }: PropsWithoutRef<{ dataSource: DataSource }>) {
    const { deleteColumn } = useContext(ColumnSettingsContext);
    const { sortables, filterables } = DataSourceSpecs[dataSource];

    return (
        <ModalContextProvider>
            {({ toggleShowing }) => (
                <>

                    <BBTooltip content={<span>Configure Column</span>}>
                        <span className="column-prefs-toggle" tabIndex={0} onClick={toggleShowing}>
                            <FontAwesomeIcon icon="cog" />
                        </span>
                    </BBTooltip>

                    <BBModal className="settings-cell" footer={
                        <div className="modal-btn btn-danger" onClick={deleteColumn}>Delete</div>
                    }>
                        <form onSubmit={e => {
                            e.preventDefault();
                            toggleShowing();
                            return false;
                        }}>
                            <label className="input-group">
                                <span className="input-header">Column Name</span>

                                <PreferenceConsumer preferenceKey="name">
                                    {([ name, setName ]) => (
                                        <input type="text" placeholder="Column Name" value={name} onChange={event => setName(event.currentTarget.value)} />
                                    )}
                                </PreferenceConsumer>
                            </label>
                            {sortables?.length ? (
                                <>
                                    <PreferenceConsumer preferenceKey="sortBy">
                                        {([ sortBy, setSortBy ]) => (
                                            <SettingsListField multi={false} options={sortables} value={sortBy || null} setValue={setSortBy} header={<>Sort By</>} />
                                        )}
                                    </PreferenceConsumer>
                                    <PreferenceConsumer preferenceKey="sortOrder">
                                        {([ sortOrder, setSortOrder ]) => (
                                            <SettingsListField multi={false} options={PossibleSortOrders} value={sortOrder || SortOrder.descending} setValue={setSortOrder} header={<>Sort Mode</>} />
                                        )}
                                    </PreferenceConsumer>
                                </>
                            ) : null}
                            {filterables?.length ? (
                                <PreferenceConsumer preferenceKey="filters">
                                    {([ filters, setFilters ]) => (
                                        filterables.map(filterType => {
                                            switch (filterType) {
                                            case "ENTRY_CONTENT_CATEGORY":
                                                return (
                                                    <SettingsListField<keyof typeof ContentCategories, true> multi={true} key={filterType} options={ALL_CATEGORIES} value={filters.ENTRY_CONTENT_CATEGORY! as unknown as Array<keyof typeof ContentCategories>} setValue={newValue => setFilters(Object.assign({}, filters, {
                                                        [ENTRY_CONTENT_CATEGORY]: newValue
                                                    }))} header={<>Content Categories</>}>
                                                        {type => <>{categoryNames[type] as string}</>}
                                                    </SettingsListField>
                                                );
                                            case "ENTRY_DUE_DATE":
                                                return (
                                                    <SettingsField type="checkbox" key={filterType} value={filters[filterType] as boolean} setValue={newValue => setFilters({
                                                        ...filters,
                                                        "ENTRY_DUE_DATE": newValue
                                                    })}>
                                                Needs Due Date
                                                    </SettingsField>
                                                );
                                            }
                                        })
                                    )}
                                </PreferenceConsumer>
                            ) : null}
                        </form>
                    </BBModal>
                </>
            )}
        </ModalContextProvider>
    );
}