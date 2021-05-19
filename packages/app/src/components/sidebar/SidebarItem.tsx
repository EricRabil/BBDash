import React from "react";
import BBTooltip from "@components/BBTooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface SidebarItemProps {
    ariaHidden?: boolean;
    tooltip: string;
    popsUp?: boolean;
    icon: IconProp;
    click?: () => void;
    spin?: boolean;
    disabled?: boolean
}

export default function SidebarItem({ ariaHidden = false, tooltip, popsUp = false, icon, click, spin, disabled = false }: SidebarItemProps) {
    return (
        <BBTooltip placement="top" content={<span>{tooltip}</span>}>
            <li
                role="menuitem"
                aria-haspopup={popsUp}
                aria-hidden={ariaHidden}
                aria-label={tooltip}
                className="sidebar-icon-container"
                attr-disabled={disabled.toString()}
                aria-disabled={disabled}
                onClick={click}
            >
                <FontAwesomeIcon icon={icon} spin={spin} />
            </li>
        </BBTooltip>
    );
}