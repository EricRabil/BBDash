import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useRef } from "react";
import { ModalContext } from "../../contexts/modal-context";
import Modal from "./Modal";

export interface BBModalContentContext {
    header?: ReactNode;
    footer?: ReactNode;
    className?: string;
    children: ReactNode;
    type?: AnyModalType;
    onDismiss?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

type AnyModalType = "create" | "edit" | "alert" | "form" | "confirm";

function commitTextForModalType(type: AnyModalType): string {
    switch (type) {
    case "create":
        return "Create";
    case "form":
        return "Submit";
    case "edit":
        return "Save";
    case "alert":
        return "Ok";
    case "confirm":
        return "Confirm";
    }
}

/**
 * Styled modal for other modals to implement. Comes with controls and a header.
 */
export default function BBModal({ header, footer, children, className, onDismiss, type = "alert" }: BBModalContentContext) {
    const innerContainer = useRef(null as HTMLElement | null);

    return (
        <Modal>
            {({ isTransitioning, isAppearing, isDisappearing, didFinish }) => (
                <ModalContext.Consumer>
                    {({ isShowing, toggleShowing, isBusy }) => (
                        <div className={`modal-container${className ? ` ${className}` : ""}`} onClick={(ev: React.MouseEvent) => {
                            if (!innerContainer.current) return;
                            if (!innerContainer.current.contains(ev.target as Node) && isShowing) {
                                toggleShowing();
                            }
                        }} attr-is-transitioning={isTransitioning.toString()} attr-is-appearing={isAppearing.toString()} attr-is-disappearing={isDisappearing.toString()} onAnimationEnd={didFinish}>
                            <div className="modal" ref={el => innerContainer.current = el}>
                                {
                                    header ? (
                                        <div className="modal-header">
                                            {header}
                                        </div>
                                    ) : null
                                }
                                <div className="modal-body">
                                    {children}
                                </div>
                                <div className="modal-footer">
                                    {footer}
                                    <button className="modal-btn" onClick={onDismiss || (() => {
                                        toggleShowing();
                                    })}>
                                        {
                                            isBusy ? (
                                                <FontAwesomeIcon icon="circle-notch" spin />
                                            ) : commitTextForModalType(type)
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalContext.Consumer>
            )}
        </Modal>
    );
}
