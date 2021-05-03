export enum RenderContentFormat {
    html = "html",
    text = "text",
    ref = "ref"
}

export interface RenderContent<Format extends RenderContentFormat> {
    format: Format;
    data?: string | null;
    className?: string | null;
    link?: string | null;
    ref?: (element: HTMLElement | null) => unknown;
    aria?: {
        label?: string | null;
        hidden?: boolean | null;
    };
    elProps?: object;
    tag?: (keyof JSX.IntrinsicElements) | null;
}

export type HTMLRenderContent = RenderContent<RenderContentFormat.html>;
export type TextRenderContent = RenderContent<RenderContentFormat.text>;

export type AnyRenderContent = HTMLRenderContent | TextRenderContent | string | null | undefined;

export interface DataCellAttributes {
    uri: string;
    courseID: string;
}

export const ENTRY_TIME = "ENTRY_TIME";
export const ENTRY_TITLE = "ENTRY_TITLE";
export const ENTRY_DUE_DATE = "ENTRY_DUE_DATE";
export const ENTRY_CONTENT_CATEGORY = "ENTRY_CONTENT_CATEGORY";
export const ENTRY_EMPTY = "ENTRY_EMPTY";

type Maybe<T> = T | undefined | null;
export type RawDate = Date | string | number;
export type MaybeDate = Maybe<RawDate>;

export interface DataCellData {
    header?: {
        title?: AnyRenderContent;
        sideTitle?: AnyRenderContent;
    };
    subtitle?: AnyRenderContent;
    description?: AnyRenderContent;
    footer?: AnyRenderContent;
    sortables?: {
        [ENTRY_TIME]?: MaybeDate;
        [ENTRY_TITLE]?: string | null;
        [ENTRY_DUE_DATE]?: MaybeDate;
    };
    filterables?: {
        [ENTRY_CONTENT_CATEGORY]?: string;
        [ENTRY_EMPTY]?: boolean;
        [ENTRY_DUE_DATE]?: boolean;
    };
    attributes: DataCellAttributes;
}

export type FilterableKey = keyof NonNullable<DataCellData["filterables"]>
export type SortableKey = keyof NonNullable<DataCellData["sortables"]>;

export interface DataCellSpec {
    filterables?: FilterableKey[];
    sortables?: SortableKey[];
}