import { startTransition, useEffect, useEffectEvent, useState } from "react";
import type { ResourceState } from "../types/dashboard";

// Den här hooken hämtar JSON med fast intervall och återanvänds av alla tre widgets.
export function usePollingResource<T>(url: string, intervalMs: number): ResourceState<T> {
    const [state, setState] = useState<ResourceState<T>>({
        data: null,
        error: null,
        isLoading: true,
        lastLoadedAt: null,
    });

    // useEffectEvent gör att intervallet kan använda senaste url/logik utan extra omrenderingar.
    const loadData = useEffectEvent(async () => {
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: "application/json",
                },
            });

            const json = (await response.json()) as T;
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            startTransition(() => {
                setState({
                    data: json,
                    error: null,
                    isLoading: false,
                    lastLoadedAt: Date.now(),
                });
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Okant fel";

            // Vid fel behåller vi senaste lyckade data så dashboarden inte blir tom i onödan.
            startTransition(() => {
                setState((currentState) => ({
                    data: currentState.data,
                    error: message,
                    isLoading: false,
                    lastLoadedAt: currentState.lastLoadedAt,
                }));
            });
        }
    });

    useEffect(() => {
        void loadData();

        const timer = window.setInterval(() => {
            void loadData();
        }, intervalMs);

        return () => {
            window.clearInterval(timer);
        };
    }, [intervalMs, url]);

    return state;
}
