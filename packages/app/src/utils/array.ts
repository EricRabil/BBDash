export function splitArray<T>(array: T[], cb: (item: T) => 0 | 1): [T[], T[]] {
    const array1: T[] = [], array2: T[] = [];

    for (const item of array) {
        ((cb(item) === 0) ? array1 : array2).push(item);
    }

    return [array1, array2];
}