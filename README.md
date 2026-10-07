# Home-screen

En dashboard-applikation för Raspberry Pi som visar väder, tunnelbaneavgångar och störningar, aktuella Stockholm-events och en digital klocka i ett enkelt kioskgränssnitt. Projektet är uppdelat i en React-klient och en Express-backend.

## Vad appen visar

- **Väder**: Aktuellt väder och prognos från Open-Meteo, plus kompakt information om kommande nederbörd, paraplybehov, vind, nederbördsmängd och luftfuktighet
- **Tunnelbana**: Avgångar från Råcksta med destination, spår och avgångstid samt prioriterad aktuell störningsinformation från SL Deviations
- **Stockholm-events**: Aktuella events den här veckan från Visit Stockholm. Event med länk kan tryckas på för att visa en QR-kod som skannas med mobilen utan att lämna dashboarden
- **Klocka**: Digital klocka som uppdateras varje minut

## Projektstruktur

```text
Home-screen/
+-- README.md
+-- deploy/
+-- homescreen/
    +-- client/
    |   +-- package.json
    |   +-- index.html
    |   +-- vite.config.ts
    |   +-- src/
    |       +-- App.tsx
    |       +-- main.tsx
    |       +-- theme.ts
    |       +-- components/
    |       +-- hooks/
    |       +-- library/
    |       +-- sections/
    |       +-- types/
    +-- server/
        +-- package.json
        +-- tsconfig.json
        +-- .env.example
        +-- src/
            +-- index.ts
            +-- library/
            +-- routes/
```

## Arkitektur

### Frontend

- React 19 med TypeScript
- Material UI för layout och styling
- Vite för utveckling och produktionsbygge
- Pollar backend via `/api/*` för att hålla UI uppdaterat
- Behåller senaste lyckade klientdata om ett enskilt anrop till backend tillfälligt misslyckas

### Backend

- Express med TypeScript
- Exponerar API-endpoints för väder, tunnelbana, Stockholm-events och hälsokontroll
- Cacherar externa svar både i minnet och persistent på disk
- Använder senaste riktiga sparade data som `stale` om en extern tjänst tillfälligt inte går att nå
- Hittar aldrig på mock-väder i produktion
- Servar den byggda klienten i produktion om `client/dist` finns
- Lyssnar endast på `127.0.0.1`, eftersom dashboarden används lokalt av Chromium på samma Raspberry Pi

Den persistenta API-cachen sparas under:

```text
~/.cache/homescreen-dashboard/
```

Cachefiler skrivs atomiskt och versionsmärks. En omstart eller auto-deploy kan därför återanvända den senaste riktiga datan även om internet eller en extern API-tjänst är nere när Pi:n startar.

## API

- `GET /api/health` - hälsokontroll
- `GET /api/weather` - väderdata med status `live` eller `stale`
- `GET /api/subway` - tunnelbaneavgångar och störningsinformation
- `GET /api/stockholm-events` - events från Visit Stockholm för den här veckan

## Datakällor

- Open-Meteo för väder
- SL Transport för avgångar
- SL Deviations för aktuell störningsinformation
- Visit Stockholm Open API för events
- QuickChart QR endpoint för QR-bilden som skapas först när ett event öppnas i QR-dialogen

## Installation och utveckling

### Förutsättningar

- Node.js 20.19+ eller en nyare version som stöds av projektets Vite-version
- npm

### 1. Installera beroenden

```bash
cd homescreen/client
npm install

cd ../server
npm install
```

### 2. Konfigurera miljövariabler

```bash
cd homescreen/server
cp .env.example .env
```

Redigera sedan `.env` med dina inställningar.

### 3. Starta utvecklingsmiljön

```bash
cd homescreen/server
npm run dev
```

I ett annat terminalfönster:

```bash
cd homescreen/client
npm run dev
```

Klienten körs på `http://localhost:5173` och servern på `http://127.0.0.1:8080`. Vites `/api`-proxy gör att klienten når servern under lokal utveckling.

### 4. Bygg för produktion

```bash
cd homescreen/client
npm run build

cd ../server
npm run build
```

## Konfiguration

Miljövariablerna finns i `homescreen/server/.env`.

- `PORT` - port för servern, standard `8080`
- `WEATHER_LATITUDE` - latitud för väderplatsen
- `WEATHER_LONGITUDE` - longitud för väderplatsen
- `WEATHER_LOCATION_NAME` - platsnamn för väderpanelen
- `WEATHER_CACHE_MS` - cache-tid för väderdata
- `SUBWAY_DEPARTURES_CACHE_MS` - cache-tid för SL-avgångar, standard 30 sekunder
- `SUBWAY_DEVIATIONS_CACHE_MS` - cache-tid för SL-störningar, standard 60 sekunder
- `STOCKHOLM_EVENTS_CACHE_MS` - cache-tid för Visit Stockholm-events
- `STOCKHOLM_EVENTS_FETCH_SIZE` - antal events att hämta från Visit Stockholm innan lokal filtrering, standard 150
- `STOCKHOLM_EVENTS_MAX_ITEMS` - max antal events att visa i dashboarden, standard 5 för Touch Display 2

Tunnelbanan är för närvarande hårdkodad till Råcksta station i serverns SL-adapter.

## Felhantering och stale-data

När en extern tjänst misslyckas försöker servern använda senaste verkliga sparade svar från disk. UI:t markerar då datan som gammal, exempelvis `Data 47 min gammal`, istället för att visa påhittade reservvärden.

För SL behandlas avgångar och störningar separat. Ett fel i störnings-API:t ska därför inte slå ut färska avgångar. Om en äldre störning visas märks den som att den kan vara inaktuell.

## Utvecklingskommandon

### Klient

```bash
cd homescreen/client
npm run dev      # Starta dev-server
npm run build    # Bygg för produktion
npm run lint     # Kör ESLint
npm run preview  # Förhandsvisa byggd app
```

### Server

```bash
cd homescreen/server
npm run dev      # Starta med ts-node-dev
npm run build    # Kompilera TypeScript
npm start        # Kör kompilerad kod
```
