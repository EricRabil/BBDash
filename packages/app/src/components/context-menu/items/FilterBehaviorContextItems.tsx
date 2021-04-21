import React, { useCallback, useContext } from "react";
import { Item } from "react-contexify";
import { FilterBehaviorContext } from "../../../contexts/filter-behavior-context";
import { ModifierKeyContext } from "../../../contexts/modifier-key-context";

export default function FilterBehaviorContextItems() {
    const { alt } = useContext(ModifierKeyContext);

    const {
        uriFiltersAreDisabledLocally,
        uriFiltersAreDisabledGlobally,
        setUriFiltersAreDisabled,
        userFiltersAreDisabledLocally,
        userFiltersAreDisabledGlobally,
        setUserFiltersAreDisabled
    } = useContext(FilterBehaviorContext);

    const uriFiltersAreDisabled = alt ? uriFiltersAreDisabledGlobally : uriFiltersAreDisabledLocally;
    const userFiltersAreDisabled = alt ? userFiltersAreDisabledGlobally : userFiltersAreDisabledLocally;

    const toggleURIFilters = useCallback(() => setUriFiltersAreDisabled(!uriFiltersAreDisabled, alt), [alt, uriFiltersAreDisabled, setUriFiltersAreDisabled]);
    const toggleUserFilters = useCallback(() => setUserFiltersAreDisabled(!userFiltersAreDisabled, alt), [alt, userFiltersAreDisabled, setUserFiltersAreDisabled]);

    return (
        <>
            <Item onClick={toggleURIFilters}>
                {uriFiltersAreDisabled ? "Enable" : "Disable"} Hiding/Pinning {alt ? "Globally" : null}
            </Item>
            <Item onClick={toggleUserFilters}>
                {userFiltersAreDisabled ? "Enable" : "Disable"} Configured Sorting/Filters {alt ? "Globally" : null}
            </Item>
        </>
    );
}