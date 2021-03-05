import React from "react";
import ReactDOM from "react-dom";
import { QueryClientProvider } from "react-query";
import App from "./App";
import "./boot/fontawesome";
import { queryClient } from "./composables/_query";
import "./scss/_index.scss";

ReactDOM.render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>,
    document.getElementById("root")
);
