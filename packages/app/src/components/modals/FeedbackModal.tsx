import React, { useRef } from "react";
import { useToasts } from "react-toast-notifications";
import { ModalContext } from "../../contexts/modal-context";
import BBModal, { BBModalContentContext } from "./BBModal";

export default function BugReportModal(props: Omit<BBModalContentContext, "children">) {
    const formRef = useRef<HTMLFormElement>();
    const { addToast } = useToasts();

    return (
        <ModalContext.Consumer>
            {({ toggleShowing, setBusy }) => (
                <BBModal {...props} header={
                    <span>Feedback Assistant</span>
                } onDismiss={async () => {
                    const formData = new FormData(formRef.current!);

                    try {
                        setBusy(true);

                        await fetch("https://api.bbdash.app/api/v1/feedback", {
                            method: "POST",
                            body: new URLSearchParams(formData as unknown as string)
                        });

                        addToast((
                            <div>Thanks for your feedback. We&apos;ll reach out to you if we need more information.</div>
                        ), {
                            appearance: "success",
                            autoDismiss: true,
                            id: "feedback-notice"
                        });
                    } catch(e) {
                        addToast((
                            <div>Sorry, we couldn&apos;t send your feedback. Please try again later.</div>
                        ), {
                            appearance: "error",
                            autoDismiss: true,
                            id: "feedback-notice"
                        });
                    } finally {
                        setBusy(false);
                        toggleShowing();
                    }
                }} type="form">
                    <form ref={e => formRef.current = e!}>
                        <label className="input-group">
                            <span className="input-header">Email</span>
                            <input name="email" type="email" />
                        </label>
                        <label className="input-group">
                            <span className="input-header">Title</span>
                            <input name="title" type="text" />
                        </label>
                        <label className="input-group">
                            <span className="input-header">Feedback</span>
                            <textarea name="feedback" />
                        </label>
                    </form>
                </BBModal>
            )}
        </ModalContext.Consumer>
    );
}