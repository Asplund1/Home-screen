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

    const pad = (value: number) => value.toString().padStart(2, "0");
    const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    const now = new Date();
    const todayKey = dateKey(now);
    const tomorrowKey = dateKey(new Date(now.getTime() + 24 * 60 * 60_000));

    const todayForecast =
        data?.hourly.filter((item) => dateKey(new Date(item.time)) === todayKey).slice(0, 4) ?? [];
    const tomorrowForecast =
        data?.hourly.filter((item) => dateKey(new Date(item.time)) === tomorrowKey).slice(0, 4) ?? [];

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
                                {data.current.temperatureC != null ? data.current.temperatureC : "-"}
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
                                            <span className="forecast-temp">
                                                {item.temperatureC != null ? `${item.temperatureC}°` : "-"}
                                            </span>
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
                                            <span className="forecast-temp">
                                                {item.temperatureC != null ? `${item.temperatureC}°` : "-"}
                                            </span>
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
