import { PanelFooter } from "./PanelFooter";
import { PanelFrame } from "./PanelFrame";
import { MetricCard } from "./MetricCard";
import { StatusChip } from "./StatusChip";
import { EmptyState } from "./EmptyState";
import { formatShortTime, getStatusLabel } from "../lib/format";
import type { ResourceState, WeatherData } from "../types/dashboard";

type WeatherPanelProps = {
    state: ResourceState<WeatherData>;
};

// Väderpanelen visar nuvärdet först och detaljer i andra hand.
export function WeatherPanel(props: WeatherPanelProps) {
    const { data, error, lastLoadedAt } = props.state;

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
                                <span>Grader</span>
                            </div>
                            <p className="weather-summary">{data.current.description}</p>
                        </div>

                        <div className="weather-metrics">
                            <MetricCard label="Vind" value={`${data.current.windKph} km/h`} />
                            <MetricCard label="Luftfuktighet" value={`${data.current.humidity}%`} />
                            <MetricCard label="Nederbord" value={`${data.current.precipitationMm} mm/h`} />
                            <MetricCard label="Kalla" value={data.source === "smhi" ? "SMHI" : "Demo"} />
                        </div>
                    </div>

                    <div className="chip-row">
                        <StatusChip label={data.message} />
                    </div>

                    <div className="hourly-strip">
                        {data.hourly.map((item) => (
                            <article className="hourly-card" key={item.time}>
                                <span className="hourly-time">{formatShortTime(item.time)}</span>
                                <strong>{item.temperatureC} deg</strong>
                                <span>{item.description}</span>
                                <span className="hourly-muted">
                                    {item.windKph} km/h · {item.precipitationMm} mm/h
                                </span>
                            </article>
                        ))}
                    </div>
                </>
            ) : (
                <EmptyState label={error ?? "Hamtar vaderdata..."} />
            )}
        </PanelFrame>
    );
}
