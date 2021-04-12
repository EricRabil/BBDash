// @ts-ignore
__webpack_public_path__ = "http://127.0.0.1:3000/";

import React from "react";
import ReactDOM from "react-dom";
import { QueryClientProvider } from "react-query";
import { ToastProvider } from "react-toast-notifications";
import App from "./App";
import "./boot/fontawesome";
import { queryClient } from "./composables/_query";
import { ColorCodingProvider } from "./contexts/color-coding-context";
import { CourseFilterProvider } from "./contexts/course-filter-context";
import "./scss/_index.scss";


ReactDOM.render(
    <QueryClientProvider client={queryClient}>
        <ToastProvider>
            <CourseFilterProvider>
                <ColorCodingProvider>
                    <App />
                </ColorCodingProvider>
            </CourseFilterProvider>
        </ToastProvider>
    </QueryClientProvider>,
    document.getElementById("root")
);