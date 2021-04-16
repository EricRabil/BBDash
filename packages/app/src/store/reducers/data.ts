import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { DataSource, DataSourceMapping } from "../../transformers/data-source-spec";

export type DataState = {
    [K in DataSource]: Record<string, DataSourceMapping[K]>;
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
    stream: {},
    contents: {},
    grades: {}
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
        }
    }
});

export const selectStreamData = (state: RootState) => Object.values(state.data[DataSource.stream]);
export const selectCourseContents = (state: RootState) => Object.values(state.data[DataSource.contents]);
export const selectGrades = (state: RootState) => Object.values(state.data[DataSource.grades]);
export const selectDataForSource = <T extends DataSource>(dataSource: T) => (state: RootState): DataSourceMapping[T][] => Object.values(state.data[dataSource]);

export const { dataUpdated } = dataSlice.actions;

export default dataSlice.reducer;