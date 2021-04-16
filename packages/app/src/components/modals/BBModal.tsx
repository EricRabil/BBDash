import React, { ReactNode, useRef } from "react";
import Modal, { ModalContextObjectRepresentation } from "./Modal";

export interface BBModalContentContext extends ModalContextObjectRepresentation {
    header?: ReactNode;
    footer?: ReactNode;
    className?: string;
    children: ReactNode;
    type?: AnyModalType;
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

export default function BBModal({ header, footer, children, className, type = "alert", ...ctx }: BBModalContentContext) {
    const innerContainer = useRef(null as HTMLElement | null);

    function onclick(ev: React.MouseEvent) {
        if (!innerContainer.current) return;
        if (!innerContainer.current.contains(ev.target as Node) && ctx.isShowing) {
            ctx.toggleShowing();
        }
    }

    return (
        <Modal {...ctx}>
            {({ isTransitioning, isAppearing, isDisappearing, didFinish }) => (
                <div className={`modal-container${className ? ` ${className}` : ""}`} onClick={onclick} attr-is-transitioning={isTransitioning.toString()} attr-is-appearing={isAppearing.toString()} attr-is-disappearing={isDisappearing.toString()} onAnimationEnd={didFinish}>
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
                            <div className="modal-btn" onClick={() => ctx.toggleShowing()}>{commitTextForModalType(type)}</div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export { useModal } from "./Modal";
