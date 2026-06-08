type CacheEntry<T> = {
    timestamp: number;
    data?: T;
    promise?: Promise<T>;
};

const cache = new Map<string, CacheEntry<any>>();

export async function cached<T>(key: string, fn: () => Promise<T>, ttl = 300_000): Promise<T> {
    const now = Date.now();
    const entry = cache.get(key);

    if (entry) {
        if (entry.data !== undefined && now - entry.timestamp < ttl) {
            return entry.data as T;
        }
        if (entry.promise) return entry.promise as Promise<T>;
    }

    const promise = (async () => {
        try {
            const result = await fn();
            cache.set(key, { timestamp: Date.now(), data: result });
            return result;
        } catch (err) {
            const existing = cache.get(key);
            if (existing && existing.promise) delete existing.promise;
            throw err;
        }
    })();

    cache.set(key, { timestamp: now, promise });
    return promise;
}

export function clearCache(key?: string) {
    if (key) cache.delete(key);
    else cache.clear();
}

