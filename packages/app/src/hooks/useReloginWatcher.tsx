import React, { useEffect, useRef } from "react";
import { useToasts } from "react-toast-notifications";
import { integrationAPI } from "../api";

export default function useReloginWatcher() {
    const { addToast, removeToast } = useToasts();
    const isShowingToast = useRef(false);

    const confirmRelogin = async () => {
        await integrationAPI.auth.confirmRelogin();
        isShowingToast.current = false;
        removeToast("relogin-prompt");
    };
    
    const rejectRelogin = async () => {
        await integrationAPI.auth.rejectRelogin();
        isShowingToast.current = false;
    };

    useEffect(() => {
        integrationAPI.auth.onIsLoggedOut(() => !isShowingToast.current && (isShowingToast.current = true) && addToast((
            <div onClick={confirmRelogin}>You&apos;re logged out. Click here to log back in.</div>
        ), {
            appearance: "warning",
            autoDismiss: false,
            onDismiss: rejectRelogin,
            id: "relogin-prompt"
        }));
    });
}