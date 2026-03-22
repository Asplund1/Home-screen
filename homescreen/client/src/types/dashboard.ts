// Alla typer för API-svaren samlas här så att både App och komponenter använder samma kontrakt.

export type ResourceStatus = "config_missing" | "fallback" | "live";

export type ResourceState<T> = {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    lastLoadedAt: number | null;
};

export type WeatherData = {
    current: {
        description: string;
        humidity: number | null;
        precipitationMm: number | null;
        sunrise: string | null;
        sunset: string | null;
        temperatureC: number | null;
        windKph: number | null;
    };
    hourly: Array<{
        description: string;
        precipitationMm: number | null;
        temperatureC: number | null;
        time: string;
        windKph: number | null;
    }>;
    location: string;
    message: string;
    source: "mock" | "open-meteo";
    status: ResourceStatus;
    updatedAt: string;
    fetchedAt: string;
};

export type GlucoseHistoryPoint = {
    measuredAt: string;
    valueMgdl: number;
    valueMmol: number;
};

export type GlucoseData = {
    message: string;
    note: string | null;
    reading: {
        ageMinutes: number;
        deltaMgdl: number | null;
        deltaMmol: number | null;
        measuredAt: string;
        status: "high" | "low" | "normal";
        trendArrow: string;
        trendLabel: string;
        valueMgdl: number;
        valueMmol: number;
    } | null;
    history: GlucoseHistoryPoint[];
    source: "mock" | "nightscout";
    status: ResourceStatus;
    updatedAt: string;
};

export type PollenType = {
    category: string;
    code: string;
    color: string | null;
    description: string;
    inSeason: boolean;
    name: string;
    recommendation: string | null;
    value: number;
};

export type PollenData = {
    location: string;
    message: string;
    source: "google-pollen" | "mock";
    status: ResourceStatus;
    summary: string;
    types: PollenType[];
    updatedAt: string;
};