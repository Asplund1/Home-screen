// Alla typer för API-svaren samlas här så att både App och komponenter använder samma kontrakt.

export type ResourceStatus = "fallback" | "live";

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

export type SubwayDeparture = {
  id: string;
  line: string;
  destination: string;
  departureTime: string;
  platform?: string;
  state?: string;
};

export type SubwayData = {
  station: string;
  departures: SubwayDeparture[];
  updatedAt: string;
};
