import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";

type Weather = {
    location: string;
    temperatureC: number;
    description: string;
    updatedAt: string;
};

export function WeatherWidget() {
    const [data, setData] = useState<Weather | null>(null);

    useEffect(() => {
        fetch("/api/weather")
            .then((r) => r.json())
            .then(setData);
    }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Väder</Typography>
                {!data ? (
                    <Typography>Loading…</Typography>
                ) : (
                    <>
                        <Typography>{data.location}</Typography>
                        <Typography>{data.temperatureC}°C</Typography>
                        <Typography>{data.description}</Typography>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
