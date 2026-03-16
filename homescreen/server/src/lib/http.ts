export function buildUrl(
    baseUrl: string,
    query: Record<string, boolean | number | string | undefined>,
): string {
    // Bygger query-strängen på ett säkert sätt utan manuell strängkonkatenering.
    const url = new URL(baseUrl);

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) {
            continue;
        }

        url.searchParams.set(key, String(value));
    }

    return url.toString();
}

export async function fetchJson<T>(
    url: string,
    init: RequestInit = {},
    timeoutMs = 10_000,
): Promise<T> {
    // Gemensam JSON-fetch med timeout och standardheader så att route-filerna blir enklare.
    const response = await fetch(url, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(timeoutMs),
        headers: {
            Accept: "application/json",
            ...init.headers,
        },
    });

    // Fel svar från externa API:er kastas vidare med lite diagnostisk text.
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Request to ${url} failed with ${response.status}: ${errorText.slice(0, 300)}`,
        );
    }

    // Typen T talar om för TypeScript vilken datastruktur som förväntas tillbaka.
    return (await response.json()) as T;
}
