/**
 * Returns all keys with a value of true. If no keys are true, returns all keys with the exception of those in the second parameter.
 * @param obj object to extrapolate active state from
 * @param excludeFromDefaults keys to exclude from defaults
 */
export function activeKeys<T extends Record<string, boolean>>(obj?: T, excludeFromDefaults: (keyof T)[] = []): (keyof T)[] {
    const active = Object.entries(obj || {}).filter(([ _, enabled ]) => enabled).map(([ key ]) => key);
    if (active.length === 0) return Object.keys(obj || {}).filter(key => !excludeFromDefaults.includes(key));
    else return active;
}