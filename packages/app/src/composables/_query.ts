import { QueryClient } from "react-query";
import { createLocalStoragePersistor } from "react-query/createLocalStoragePersistor-experimental";
import { persistQueryClient } from "react-query/persistQueryClient-experimental";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    }
});

const localStoragePersistor = createLocalStoragePersistor();
 
persistQueryClient({
    queryClient,
    persistor: localStoragePersistor,
});