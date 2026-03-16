type CacheEntry<T> = {
    expiresAt: number;
    value: T;
};

// Enkel minnescache för API-svar så att externa tjänster inte anropas onödigt ofta.
const cache = new Map<string, CacheEntry<unknown>>();

export async function withCache<T>(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>,
): Promise<T> {
    const now = Date.now();
    const cached = cache.get(key) as CacheEntry<T> | undefined;

    // Om vi redan har ett färskt värde returnerar vi det direkt.
    if (cached && cached.expiresAt > now) {
        return cached.value;
    }

    try {
        // Annars laddar vi nytt värde och sparar det med en utgångstid.
        const freshValue = await loader();
        cache.set(key, {
            value: freshValue,
            expiresAt: Date.now() + ttlMs,
        });

        return freshValue;
    } catch (error) {
        // Vid tillfälligt fel kan ett gammalt värde vara bättre än inget alls för en dashboard.
        if (cached) {
            return cached.value;
        }

        throw error;
    }
}
