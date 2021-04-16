import React from "react";
import BBModal, { BBModalContentContext } from "./BBModal";

export default function BugReportModal(props: Omit<BBModalContentContext, "children">) {
    return (
        <BBModal {...props} header={
            <span>Feedback Assistant</span>
        } type="form">
            <form>
                <label className="input-group">
                    <span className="input-header">Email</span>
                    <input type="email" />
                </label>
                <label className="input-group">
                    <span className="input-header">Feedback</span>
                    <textarea />
                </label>
            </form>
        </BBModal>
    );
}