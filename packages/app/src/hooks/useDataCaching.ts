import { selectObjectDataForSource } from "@reducers/data";
import { DataSource } from "@transformers/data-source-spec";
import { useSelector } from "react-redux";
import useEffectAfterFirstRun from "./useEffectAfterFirstRun";

function createUseCachedDataSource<DataSourceType extends DataSource>(source: DataSourceType) {
    return function useCachedDataSource() {
        const data = useSelector(selectObjectDataForSource(source));

        useEffectAfterFirstRun(() => {
            localStorage.setItem(`${source}--cache`, JSON.stringify(data));
        }, [data], false);
    };
}

const cachedDataSourceHooks = Object.values(DataSource).map(createUseCachedDataSource);

export default function useDataCaching() {
    for (const hook of cachedDataSourceHooks) {
        hook();
    }
}