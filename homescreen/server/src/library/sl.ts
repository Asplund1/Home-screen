import { fetchJson } from "./http";

const SL_BASE_URL = "https://transport.integration.sl.se/v1";
const RACKSTA_SITE_ID = 9104;

type SlDeparture = {
    destination?: string;
    display?: string;
    scheduled: string;
    expected?: string;
    state?: string;
    line?: {
        designation?: string;
        transport_mode?: string;
    };
    stop_point?: {
        designation?: string;
    };
};

type SlDeparturesResponse = {
    departures?: SlDeparture[];
};

export type SubwayDeparture = {
    id: string;
    line: string;
    destination: string;
    departureTime: string;
    platform?: string;
    state?: string;
};

export async function getRackstaSubwayDepartures(): Promise<
    SubwayDeparture[]
> {
    const url = `${SL_BASE_URL}/sites/${RACKSTA_SITE_ID}/departures`;

    const data = await fetchJson<SlDeparturesResponse>(url);

    return (data.departures ?? [])
        .filter((departure) => departure.line?.transport_mode === "METRO")
        .filter((departure) => departure.state !== "NOTEXPECTED")
        .sort(sortByDepartureTime)
        .slice(0, 6)
        .map(formatDeparture);
}

function sortByDepartureTime(
    first: SlDeparture,
    second: SlDeparture,
): number {
    const firstTime = first.expected ?? first.scheduled;
    const secondTime = second.expected ?? second.scheduled;

    return new Date(firstTime).getTime() - new Date(secondTime).getTime();
}

function formatDeparture(
    departure: SlDeparture,
    index: number,
): SubwayDeparture {
    return {
        id: createDepartureId(departure, index),
        line: departure.line?.designation ?? "",
        destination: departure.destination ?? "Okänd destination",
        departureTime:
            departure.state === "CANCELLED"
                ? "Inställd"
                : departure.display ?? formatTime(departure),
        platform: departure.stop_point?.designation,
        state: departure.state,
    };
}

function createDepartureId(
    departure: SlDeparture,
    index: number,
): string {
    return [
        departure.line?.designation ?? "unknown",
        departure.destination ?? "unknown",
        departure.scheduled,
        index,
    ].join("-");
}

function formatTime(departure: SlDeparture): string {
    const departureDate = new Date(
        departure.expected ?? departure.scheduled,
    );

    return new Intl.DateTimeFormat("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Stockholm",
    }).format(departureDate);
}