// @ts-ignore
__webpack_public_path__ = "http://127.0.0.1:3000/";

if (process.env.REACT_APP_WDYR === "I_WANTED_TO") {
    // eslint-disable-next-line
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ToastProvider } from "react-toast-notifications";
import App from "./App";
import "./boot/fontawesome";
import { ColorCodingProvider } from "./contexts/color-coding-context";
import { PersistentCourseBlacklistProvider } from "./contexts/course-blacklist-context";
import { FilterBehaviorProvider } from "./contexts/filter-behavior-context";
import { PersistentItemOrganizerProvider } from "./contexts/item-organizer-context";
import { ModifierKeyProvider } from "./contexts/modifier-key-context";
import { RightClickContextProvider } from "./contexts/right-click-context";
import "./scss/_index.scss";
import { store } from "./store";
import { reloadAll } from "./store/connection";

reloadAll();

ReactDOM.render(
    <Provider store={store}>
        <ToastProvider>
            <FilterBehaviorProvider>
                <PersistentItemOrganizerProvider hiddenKey="hidden-items" pinnedKey="pinned-items">
                    <ColorCodingProvider>
                        <RightClickContextProvider>
                            <PersistentCourseBlacklistProvider>
                                <ModifierKeyProvider>
                                    <App />
                                </ModifierKeyProvider>
                            </PersistentCourseBlacklistProvider>
                        </RightClickContextProvider>
                    </ColorCodingProvider>
                </PersistentItemOrganizerProvider>
            </FilterBehaviorProvider>
        </ToastProvider>
    </Provider>,
    document.getElementById("root")
);