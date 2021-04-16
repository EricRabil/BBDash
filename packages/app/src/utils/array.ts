/**
 * Splits an array into two parts, with a callback that determines which one it should be placed in.
 * @param array array to split
 * @param cb function to split the items
 * @returns two arrays, where the first is items that map to 0 and the second is items that map to 1
 */
export function splitArray<T>(array: T[], cb: (item: T) => 0 | 1): [T[], T[]] {
    const array1: T[] = [], array2: T[] = [];

    for (const item of array) {
        ((cb(item) === 0) ? array1 : array2).push(item);
    }

    return [array1, array2];
}