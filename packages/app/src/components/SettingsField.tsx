import React, { PropsWithChildren, useMemo } from "react";

type InferredValueType<T extends string, Multi extends boolean> = Multi extends true ? T[] : T;

export interface SettingsListFieldProps<T extends string, Multi extends boolean> {
    options: T[];
    multi: Multi;
    value: InferredValueType<T, Multi> | null;
    header: JSX.Element;
    setValue(newValue: InferredValueType<T, Multi>): void;
    children?: (option: T) => JSX.Element;
}

/**
 * Represents either a radio or checklist.
 */
export function SettingsListField<T extends string, Multi extends boolean>(props: SettingsListFieldProps<T, Multi>) {
    const children = useMemo(() => typeof props.children === "function" ? props.children : null, [props.children]);

    return (
        <div className="multi-input-group">
            <div className="input-header">
                {props.header}
            </div>
            <div className="multi-input-body">
                {props.options.map(option => (
                    <SettingsField key={option} type={props.multi ? "checkbox" : "radio"} name={option} value={props.multi === true ? ((props.value as T[] | undefined) || []).includes(option) : props.value === option as T} setValue={newValue => {
                        if (props.multi) {
                            const values = (props.value as string[] | undefined)?.slice() || [];

                            if (newValue && !values.includes(option)) values.push(option);
                            else if (!newValue && values.includes(option)) values.splice(values.indexOf(option), 1);

                            props.setValue(values as any);
                        } else if (newValue) {
                            props.setValue(option as any);
                        }
                    }}>
                        {children ? children(option) : option}
                    </SettingsField>
                ))}
            </div>
        </div>
    );
}

type ExtractValueType<T extends string | number | boolean, Type extends string> = Type extends "checkbox" ? boolean : Type extends "radio" ? boolean : T;

export interface SettingsFieldProps<T extends string | number | boolean, Type extends string> {
    value: ExtractValueType<T, Type>;
    setValue(newValue: ExtractValueType<T, Type>): void;
    name?: string;
    type: Type;
}

/**
 * Represents one unit of data, supports everything that input[type] supports
 */
export default function SettingsField<T extends string | number | boolean, Type extends string>(props: PropsWithChildren<SettingsFieldProps<T, Type>>) {
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