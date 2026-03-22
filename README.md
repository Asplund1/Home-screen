# Home-screen

Dashboard för Raspberry Pi, byggd i React och Express.

## Vad appen visar nu

- Väder från SMHI
- Glukos från Nightscout
- Pollenprognos från open-meteo

## Struktur

- `homescreen/client` innehåller React-klienten
- `homescreen/server` innehåller Express-backend och API-integrationer
- `homescreen/server/.env.example` visar all konfiguration som behövs

## Lokal utveckling

1. Installera beroenden i `homescreen/client` och `homescreen/server`
2. Kopiera `homescreen/server/.env.example` till `homescreen/server/.env`
3. Starta servern i `homescreen/server` med `npm run dev`
4. Starta klienten i `homescreen/client` med `npm run dev`

Klienten proxar `/api` till `http://localhost:8080`.

## Produktion på Raspberry Pi

1. Bygg klienten i `homescreen/client` med `npm run build`
2. Bygg servern i `homescreen/server` med `npm run build`
3. Starta backend i `homescreen/server` med `npm run start`
4. Öppna `http://<din-pi>:8080`

När klienten är byggd serveras `homescreen/client/dist` automatiskt av Express.

## Konfiguration

### SMHI

SMHI används utan API-nyckel. Platsen styrs med:

- `WEATHER_LATITUDE`
- `WEATHER_LONGITUDE`
- `WEATHER_LOCATION_NAME`

### Nightscout

För riktiga glukosvarden:

- satt `NIGHTSCOUT_URL` till din Nightscout-site
- satt `NIGHTSCOUT_TOKEN` om din site kraver token

Exempel:

```env
NIGHTSCOUT_URL=https://din-site.herokuapp.com
NIGHTSCOUT_TOKEN=din_token
```

## Verifierat

- `npm run lint` i `homescreen/client`
- `npm run build` i `homescreen/client`
- `npm run build` i `homescreen/server`

## Hur allt hänger ihop

Den här appen är en klassisk SPA + API-arkitektur:

1. `homescreen/client` (React)
   - Renderar användargränssnittet i webbläsaren.
   - Anropar backend via `/api` för att hämta data (väder, glukos, pollen).
   - Körs i utveckling på `http://localhost:5173` (standard Vite) som en snabb utvecklingsserver.

2. `homescreen/server` (Express)
   - Hanterar API-endpoints under `/api` (se `routes/glucose.ts`, `routes/pollen.ts`, `routes/weather.ts`).
   - Hittar data från externa API:er (SMHI, Nightscout, Google Pollen).
   - I produktion serverar den dessutom byggda klientfiler från `homescreen/client/dist`.
   - I utveckling körs den på `http://localhost:8080`.

### Varför köra både server och klient i lokal utveckling

- React-klienten behöver en utvecklingsserver (Vite) för snabb omladdning, HMR och modulbygge.
- Express-servern behöver API-logiken och hemliga nycklar från `.env` (Nightscout, Google Pollen) och kan inte ersättas av klienten.
- Klienten använder proxyregler (`/api` → `http://localhost:8080`) för att undvika CORS och simulera samma struktur som i produktion.

### Interaktionen i utveckling

- Öppna klienten i webbläsaren (`localhost:5173`).
- När klienten gör `fetch('/api/weather')`, proxas det till `http://localhost:8080/api/weather`.
- Servern hämtar data från externa API:er, cacher det (om konfigurerat), och returnerar JSON.
- Klienten visar data i `GlucoseChart`, `WeatherPanel`, `PollenPanel` osv.

### Interaktionen i produktion (Raspberry Pi)

- Klienten byggs (`npm run build`) och resultatet (`dist`) läggs i `homescreen/client/dist`.
- Servern byggs och startas (`npm run start`). Den serverar frontenden statiskt och API:erna på samma domän.
- Användaren besöker `http://<din-pi>:8080` och hela appen (UI + API) körs via samma origin.

Genom att ha denna separation får du:

- snabb utveckling (Vite HMR) + säkra serveranrop i dev
- tydlig ansvarsfördelning (UI vs. dataaggregation)
- smidig produktionsdistribution (Express hanterar både frontend + backend)
