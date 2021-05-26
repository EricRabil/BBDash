import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { DataSource, DataSourceMapping } from "../../transformers/data-source-spec";

function unarchiveDataSource<DataSourceType extends DataSource>(source: DataSourceType): Record<string, DataSourceMapping[DataSourceType]> {
    const cached = localStorage.getItem(`${source}--cache`);
    if (!cached) return {};
    return JSON.parse(cached);
}

export type DataState = {
    [K in DataSource]: Record<string, DataSourceMapping[K]>;
} & {
    syncState: {
        [K in DataSource]: boolean;
    }
}

export interface UpdateData<DataSourceType extends DataSource, DataSourceValue> {
    dataSource: DataSourceType;
    data: DataSourceValue[];
}

type FilterFlags<Base, Condition> = {
    [Key in keyof Base]: 
        Base[Key] extends Condition ? Key : never
};

const idKeys: {
    [K in DataSource]: keyof FilterFlags<DataSourceMapping[K], string>;
} = {
    [DataSource.stream]: "se_id",
    [DataSource.contents]: "id",
    [DataSource.grades]: "courseID"
};

const initialState: DataState = {
    stream: unarchiveDataSource(DataSource.stream),
    contents: unarchiveDataSource(DataSource.contents),
    grades: unarchiveDataSource(DataSource.grades),
    syncState: {
        stream: false,
        contents: false,
        grades: false
    }
};

export const dataSlice = createSlice({
    name: "data",
    initialState,
    reducers: {
        dataUpdated<DataSourceType extends DataSource, DataSourceValue extends DataState[DataSourceType][string]>(state: DataState, { payload: { dataSource, data } }: PayloadAction<UpdateData<DataSourceType, DataSourceValue>>) {
            const key: keyof DataSourceValue = idKeys[dataSource] as unknown as keyof DataSourceValue;

            for (const item of data) {
                state[dataSource][item[key] as unknown as keyof DataState[DataSourceType]] = item;
            }
        },
        syncStateChanged<DataSourceType extends DataSource>(state: DataState, { payload: { dataSource, syncing } }: PayloadAction<{ dataSource: DataSourceType, syncing: boolean }>) {
            state.syncState[dataSource] = syncing;
        }
    }
});

function curriedSelector<T, R>(cb: (arg0: T) => (state: RootState) => R): (arg0: T) => (state: RootState) => R {
    const selectors: Map<T, (state: RootState) => R> = new Map();

    return arg0 => {
        if (selectors.has(arg0)) return selectors.get(arg0)!;
        const selector = cb(arg0);
        selectors.set(arg0, selector);
        return selector;
    };
}

export const selectStreamData = (state: RootState) => Object.values(state.data[DataSource.stream]);
export const selectCourseContents = (state: RootState) => Object.values(state.data[DataSource.contents]);
export const selectGrades = (state: RootState) => Object.values(state.data[DataSource.grades]);
export const selectObjectDataForSource = curriedSelector(<T extends DataSource>(dataSource: T) => (state: RootState): Record<string, DataSourceMapping[T]> => state.data[dataSource] as Record<string, DataSourceMapping[T]>);
export const selectDataForSource = curriedSelector(<T extends DataSource>(dataSource: T) => (state: RootState): DataSourceMapping[T][] => Object.values(state.data[dataSource]));
export const selectSyncStateForSource = curriedSelector(<T extends DataSource>(dataSource: T) => (state: RootState): boolean => state.data.syncState[dataSource]);
export const selectSyncState = (state: RootState) => state.data.syncState;

export const { dataUpdated, syncStateChanged } = dataSlice.actions;

export default dataSlice.reducer;