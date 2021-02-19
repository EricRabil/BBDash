export function activeKeys<T extends Record<string, boolean>>(obj?: T, excludeFromDefaults: (keyof T)[] = []): (keyof T)[] {
    const active = Object.entries(obj || {}).filter(([ _, enabled ]) => enabled).map(([ key ]) => key);
    if (active.length === 0) return Object.keys(obj || {}).filter(key => !excludeFromDefaults.includes(key));
    else return active;
}