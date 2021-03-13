import React from "react";
import { GIT_HASH } from "../../utils/git";
import BBModal, { BBModalContentContext } from "../BBModal";

export default function SettingsModal(props: Omit<BBModalContentContext, "children">) {
    return (
        <BBModal {...props} header={
            <span>Settings</span>
        }>
            <span>BBDash {GIT_HASH}</span>
        </BBModal>
    );
}