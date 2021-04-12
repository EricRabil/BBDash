import React, { PropsWithChildren } from "react";

export interface ColumnSettingsListFieldProps<T extends string, Multi extends boolean> {
    options: T[];
    multi: Multi;
    value: Multi extends true ? Record<T, boolean> : T;
    header: JSX.Element;
    setValue(newValue: Multi extends true ? Record<T, boolean> : T): void;
    children: (option: T) => JSX.Element;
}

export function ColumnSettingsListField<T extends string, Multi extends boolean>(props: ColumnSettingsListFieldProps<T, Multi>) {
    return (
        <div className="multi-input-group">
            <div className="input-header">
                {props.header}
            </div>
            <div className="multi-input-body">
                {props.options.map(option => (
                    <ColumnSettingsField key={option} type={props.multi ? "checkbox" : "radio"} name={option} value={props.multi === true ? (props.value as Record<T, boolean>)[option] === true : props.value === option as T} setValue={newValue => {
                        if (props.multi) {
                            props.setValue(Object.assign({}, props.value, {
                                [option]: newValue
                            }));
                        } else if (newValue) {
                            props.setValue(option as any);
                        }
                    }}>
                        {props.children(option)}
                    </ColumnSettingsField>
                ))}
            </div>
        </div>
    );
}

type ExtractValueType<T extends string | number | boolean, Type extends string> = Type extends "checkbox" ? boolean : Type extends "radio" ? boolean : T;

export interface ColumnSettingsFieldProps<T extends string | number | boolean, Type extends string> {
    value: ExtractValueType<T, Type>;
    setValue(newValue: ExtractValueType<T, Type>): void;
    name: string;
    type: Type;
}

export default function ColumnSettingsField<T extends string | number | boolean, Type extends string>(props: PropsWithChildren<ColumnSettingsFieldProps<T, Type>>) {
    const isCheckable = props.type === "checkbox" || props.type === "radio";

    return (
        <label for-input-type={props.type}>
            <input type={props.type} checked={isCheckable ? props.value === true : undefined} name={props.name} value={isCheckable ? undefined : props.value.toString()} onChange={event => {
                const newValue = isCheckable ? event.target.checked : typeof props.value === "number" ? parseFloat(event.target.value) : event.target.value;

                props.setValue(newValue as unknown as ExtractValueType<T, Type>);
            }} />

            <span>{props.children}</span>
        </label>
    );
}