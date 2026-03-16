import { PanelFooter } from "./PanelFooter";
import { PanelFrame } from "./PanelFrame";
import { EmptyState } from "./EmptyState";
import { formatShortTime, getStatusLabel } from "../lib/format";
import type { ResourceState, WeatherData } from "../types/dashboard";

type WeatherPanelProps = {
    state: ResourceState<WeatherData>;
};

// Väderpanelen visar nuvärdet först och detaljer i andra hand.
export function WeatherPanel(props: WeatherPanelProps) {
    const { data, error, lastLoadedAt } = props.state;

    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const tomorrowKey = new Date(now.getTime() + 24 * 60 * 60_000).toISOString().slice(0, 10);

    const todayForecast = data?.hourly.filter((item) => item.time.startsWith(todayKey)).slice(0, 4) ?? [];
    const tomorrowForecast = data?.hourly.filter((item) => item.time.startsWith(tomorrowKey)).slice(0, 4) ?? [];

    return (
        <PanelFrame
            className="panel-weather"
            eyebrow="SMHI vader"
            title={data?.location ?? "Linkoping"}
            status={getStatusLabel(data?.status, error)}
            footer={
                <PanelFooter
                    error={error}
                    lastLoadedAt={lastLoadedAt}
                    updatedAt={data?.updatedAt}
                />
            }
        >
            {data ? (
                <>
                    <div className="weather-hero">
                        <div>
                            <div className="weather-temp">
                                {data.current.temperatureC}
                                <span>°C</span>
                            </div>
                            <p className="weather-summary">{data.current.description}</p>
                        </div>
                    </div>

                    <div className="weather-forecast">
                        <div className="forecast-group">
                            <strong>Resten av dagen</strong>
                            {todayForecast.length ? (
                                <ul>
                                    {todayForecast.map((item) => (
                                        <li key={item.time}>
                                            <span className="forecast-time">{formatShortTime(item.time)}</span>
                                            <span className="forecast-temp">{item.temperatureC}°</span>
                                            <span className="forecast-label">{item.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="forecast-empty">Ingen data.</p>
                            )}
                        </div>

                        <div className="forecast-group">
                            <strong>Imorgon</strong>
                            {tomorrowForecast.length ? (
                                <ul>
                                    {tomorrowForecast.map((item) => (
                                        <li key={item.time}>
                                            <span className="forecast-time">{formatShortTime(item.time)}</span>
                                            <span className="forecast-temp">{item.temperatureC}°</span>
                                            <span className="forecast-label">{item.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="forecast-empty">Ingen data.</p>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <EmptyState label={error ?? "Hamtar vaderdata..."} />
            )}
        </PanelFrame>
    );
}
