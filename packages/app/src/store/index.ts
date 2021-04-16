import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "./reducers/courses";
import dataReducer from "./reducers/data";

export const store = configureStore({
    reducer: {
        data: dataReducer,
        courses: coursesReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
