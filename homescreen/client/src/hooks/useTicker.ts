import { useEffect, useState } from "react";

// Liten hook som bara uppdaterar klockan i gränssnittet.
export function useTicker(intervalMs: number): Date {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date());
        }, intervalMs);

        return () => {
            window.clearInterval(timer);
        };
    }, [intervalMs]);

    return now;
}
