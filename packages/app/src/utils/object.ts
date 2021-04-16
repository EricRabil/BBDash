type ValueOf<T> = T[keyof T];

export function mapObject<Object, NewValue>(object: Object, mapper: (key: string, value: ValueOf<Object>) => [string, NewValue]): Record<string, NewValue> {
    return Object.fromEntries(Object.entries(object).map(([ key, value ]) => mapper(key, value)));
}

export function filterObject<Object>(object: Object, filter: <Key extends keyof Object>(key: Key, value: Object[Key]) => boolean): Partial<Object> {
    return Object.fromEntries(Object.entries(object).filter(([ key, value ]) => filter(key as keyof Object, value))) as unknown as Partial<Object>;
}