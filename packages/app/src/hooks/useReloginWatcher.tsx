// import { integrationAPI } from "../api";

/**
 * Mounts listeners that prompt the user when they have been logged out
 */
export default function useReloginWatcher() {
    // const { addToast, removeToast } = useToasts();
    // const isShowingToast = useRef(false);

    // const confirmRelogin = async () => {
    //     await integrationAPI.auth.confirmRelogin();
    //     isShowingToast.current = false;
    //     removeToast("relogin-prompt");
    // };
    
    // const rejectRelogin = async () => {
    //     await integrationAPI.auth.rejectRelogin();
    //     isShowingToast.current = false;
    // };

    // useEffect(() => {
    //     integrationAPI.auth.onIsLoggedOut(() => !isShowingToast.current && (isShowingToast.current = true) && addToast((
    //         <div onClick={confirmRelogin}>You&apos;re logged out. Click here to log back in.</div>
    //     ), {
    //         appearance: "warning",
    //         autoDismiss: false,
    //         onDismiss: rejectRelogin,
    //         id: "relogin-prompt"
    //     }));
    // });
}