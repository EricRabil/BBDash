import React from "react";
import { Size } from "react-virtualized";
import AutoSizer from "react-virtualized-auto-sizer";
import DynamicSizeList, { DynamicSizeListProps } from "react-window-dynamic-size-list";

export type AutoSizingDynamicSizeListProps<T, MemoState> = Omit<DynamicSizeListProps<T, MemoState>, "width" | "height">;

/**
 * Wraps a DynamicSizeList in an AutoSizer so that you don't need to
 */
export default function AutoSizingDynamicSizeList<T, MemoState>(props: AutoSizingDynamicSizeListProps<T, MemoState>) {
    return (
        <AutoSizer>
            {function SizedDynamicList({ width, height }: Size) {
                return (
                    <DynamicSizeList {...props} width={width} height={height} />
                );
            }}
        </AutoSizer>
    );
}