import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectSyncState } from "@reducers/data";

export default function useSyncInsights() {
    const syncState = useSelector(selectSyncState);
    const [anySyncing, setAnySyncing] = useState(false);
    const [allSyncing, setAllSyncing] = useState(false);

    useEffect(() => {
        const allSyncStates = Object.values(syncState);
        setAnySyncing(allSyncStates.some(syncing => syncing));
        setAllSyncing(allSyncStates.every(syncing => syncing));
    }, [syncState]);

    return {
        syncState,
        anySyncing,
        allSyncing
    };
}