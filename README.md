# Home-screen

En omfattande dashboard-applikation byggd för Raspberry Pi, som visar väder, glukosnivåer, pollenprognoser och klocka i ett snyggt gränssnitt. Applikationen är uppdelad i en React-frontend (klient) och en Express-backend (server) för optimal separation av ansvar.

## Vad applikationen visar

- **Väderprognos**: Aktuellt väder, temperatur, nederbörd, vind och soluppgång/solnedgång från Open-Meteo API
- **Glukosdata**: Realtime glukosnivåer från Nightscout med historisk kurva över senaste dygnet
- **Pollenprognos**: Aktuella pollennivåer för olika typer (al, björk, gräs, gråbo) från Open-Meteo
- **Klocka**: Digital klocka som uppdateras varje minut

## Projektstruktur - Detaljerad översikt

Projektet är organiserat i följande struktur:

```
Home-screen/
├── package.json                 # Rotens package.json (minimal, endast beroenden)
├── README.md                    # Denna fil
└── homescreen/                  # Huvudmappen för applikationen
    ├── client/                  # React-frontend
    │   ├── package.json         # Klientens beroenden och scripts
    │   ├── index.html           # HTML-mall för React-appen
    │   ├── vite.config.ts       # Vite-konfiguration för bygg och dev-server
    │   ├── tsconfig.json        # TypeScript-konfiguration för klienten
    │   ├── tsconfig.app.json    # App-specifik TS-konfiguration
    │   ├── tsconfig.node.json   # Node-specifik TS-konfiguration
    │   ├── eslint.config.js     # ESLint-konfiguration
    │   └── src/                 # Källkod för klienten
    │       ├── main.tsx         # Entrypunkt - monterar React-appen
    │       ├── App.tsx          # Huvudkomponent som orchestrerar allt
    │       ├── theme.ts         # Material-UI tema och styling
    │       ├── types/           # TypeScript-typer
    │       │   └── dashboard.ts # Delade typer för API-svar
    │       ├── hooks/           # React-hooks för återanvändbar logik
    │       │   ├── usePollingResource.ts # Hook för att hämta data med intervall
    │       │   └── useTicker.ts # Hook för att uppdatera klockan
    │       ├── library/         # Hjälpfunktioner
    │       │   └── format.ts    # Formateringsfunktioner för datum/tid
    │       ├── sections/        # Huvudsektioner i dashboarden
    │       │   ├── index.ts     # Exports för alla sektioner
    │       │   ├── WeatherSection.tsx    # Väder-sektionen
    │       │   ├── GlucoseSection.tsx    # Glukos-sektionen
    │       │   ├── PollenSection.tsx     # Pollen-sektionen
    │       │   └── ClockSection.tsx      # Klock-sektionen
    │       └── components/      # Återanvändbara UI-komponenter
    │           ├── EmptyState.tsx        # Tomt tillstånd (laddar/fel)
    │           ├── GlucoseChart.tsx      # SVG-kurva för glukos
    │           ├── GlucosePanel.tsx      # Glukos-panel med data/visning
    │           ├── PanelFooter.tsx       # Footer med status/synktid
    │           ├── PanelFrame.tsx        # (Kommenterad) Gemensam panelram
    │           ├── PollenPanel.tsx       # Pollen-panel med nivåer
    │           └── WeatherPanel.tsx      # Väder-panel med prognos
    └── server/                  # Express-backend
        ├── package.json         # Serverns beroenden och scripts
        ├── tsconfig.json        # TypeScript-konfiguration för servern
        ├── .env.example         # Exempel på miljövariabler
        └── src/                 # Källkod för servern
            ├── index.ts         # Entrypunkt - startar Express-servern
            ├── library/         # Hjälpfunktioner för servern
            │   ├── cache.ts     # Minnescache för API-svar
            │   ├── env.ts       # Miljövariabel-hantering
            │   └── http.ts      # HTTP-hjälpfunktioner (fetch, URL-bygg)
            └── routes/          # API-routes
                ├── glucose.ts   # Glukos-route (Nightscout-integration)
                ├── pollen.ts    # Pollen-route (Open-Meteo)
                └── weather.ts   # Väder-route (Open-Meteo)
```

## Hur allt hänger ihop - Arkitektur

Applikationen följer en klassisk **SPA (Single Page Application) + API**-arkitektur:

### Frontend (React/Vite)

- **Syfte**: Rendera användargränssnittet och hantera användarinteraktioner
- **Teknik**: React 19, TypeScript, Material-UI (MUI), Vite för bygg/dev
- **Kommunikation**: Gör fetch-anrop till `/api/*` endpoints
- **Datahantering**: Använder custom hooks för polling av data med intervall
- **Layout**: 2x2 grid med fyra paneler (väder, pollen, glukos, klocka)

### Backend (Express/TypeScript)

- **Syfte**: Agregator av externa API:er, caching, säkerhet
- **Teknik**: Express 5, TypeScript, Node.js
- **API-routes**: `/api/weather`, `/api/glucose`, `/api/pollen`
- **Caching**: Minnesbaserad cache för att undvika överbelastning av externa API:er
- **Felhantering**: Fallback till mock-data vid API-fel

### Dataflöde

1. **Klient** → Gör periodiska fetch-anrop till `/api/*`
2. **Server** → Hämtar data från externa API:er (Open-Meteo, Nightscout)
3. **Server** → Transformerar och cacher data, returnerar JSON
4. **Klient** → Renderar data i respektive paneler

### Utveckling vs Produktion

- **Utveckling**: Klient körs på `localhost:5173`, server på `localhost:8080`
- **Proxy**: Vite proxar `/api` till servern för CORS-fri utveckling
- **Produktion**: Servern serverar byggd klient statiskt från samma port

## Detaljerad förklaring av varje fil

### Rotnivå

- **`package.json`**: Innehåller endast `express-rate-limit` som beroende. Används troligen för framtida rate-limiting.

### Klient (`homescreen/client/`)

#### Konfigurationsfiler

- **`package.json`**: Definierar React-appen med beroenden som `@mui/material`, `react`, `vite`. Scripts: `dev`, `build`, `lint`.
- **`vite.config.ts`**: Konfigurerar Vite med React-plugin och proxy för `/api` → `http://localhost:8080`.
- **`tsconfig.*.json`**: TypeScript-konfigurationer för app, node och allmänna inställningar.
- **`eslint.config.js`**: ESLint med React-hooks och refresh plugins.
- **`index.html`**: Grundläggande HTML-mall med `<div id="root">` för React-mounting.

#### Källkod (`src/`)

##### Entrypunkt och huvudkomponenter

- **`main.tsx`**: Monterar React-appen i DOM med ThemeProvider och CssBaseline. Använder StrictMode för utvecklingsvarningar.
- **`App.tsx`**: Huvudkomponent som:
  - Använder `usePollingResource` för att hämta data från API:er med olika intervall
  - Använder `useTicker` för klockuppdatering
  - Renderar fyra sektioner i ett CSS Grid (2x2 layout)

##### Tema och styling

- **`theme.ts`**: Material-UI tema med mörkt färgschema, anpassade komponentoverrides och gradient-bakgrunder.

##### Typer

- **`types/dashboard.ts`**: TypeScript-interfaces för alla API-svar (WeatherData, GlucoseData, PollenData, etc.) och gemensamma typer som `ResourceState`.

##### Hooks

- **`hooks/usePollingResource.ts`**: Custom hook som:
  - Hämtar JSON-data med fetch
  - Uppdaterar med intervall via setInterval
  - Hanterar laddning, fel och caching av senaste data
  - Använder `startTransition` för smooth UI-uppdateringar
- **`hooks/useTicker.ts`**: Enkel hook som returnerar aktuell tid, uppdaterad med intervall.

##### Hjälpfunktioner

- **`library/format.ts`**: Formateringsfunktioner för datum/tid, statusetiketter och glukos-status.

##### Sektioner

- **`sections/index.ts`**: Re-exports alla sektioner för enkel import.
- **`sections/WeatherSection.tsx`**: Filtrerar väderdata för idag/imorgon, renderar WeatherPanel.
- **`sections/GlucoseSection.tsx`**: Sätter bakgrund baserat på glukosnivå, renderar GlucosePanel.
- **`sections/PollenSection.tsx`**: Renderar PollenPanel med pollenprognoser.
- **`sections/ClockSection.tsx`**: Visar digital klocka med stort typsnitt.

##### Komponenter

- **`components/EmptyState.tsx`**: Visar laddningsindikator eller felmeddelanden med shimmer-animation.
- **`components/PanelFooter.tsx`**: Visar synkstatus, senaste uppdatering och felmeddelanden.
- **`components/WeatherPanel.tsx`**: Visar aktuellt väder och prognos för idag/imorgon med ikoner.
- **`components/GlucosePanel.tsx`**: Visar glukosvärde, trend, delta och historisk kurva.
- **`components/GlucoseChart.tsx`**: SVG-baserad kurva som visar glukos över tid med grid och senaste punkt markerad.
- **`components/PollenPanel.tsx`**: Visar pollennivåer för olika typer med färgkodade kort.
- **`components/PanelFrame.tsx`**: (Kommenterad) Gemensam layout-komponent för paneler.

### Server (`homescreen/server/`)

#### Konfigurationsfiler

- **`package.json`**: Express-app med beroenden `express`, `cors`. Scripts: `dev` (ts-node-dev), `build` (tsc), `start` (node).
- **`tsconfig.json`**: TypeScript-konfiguration för CommonJS output.
- **`.env.example`**: Exempel på alla miljövariabler för konfiguration.

#### Källkod (`src/`)

##### Entrypunkt

- **`index.ts`**: Startar Express-servern med:
  - CORS middleware
  - JSON parsing
  - Health check endpoint (`/api/health`)
  - Route-mounting för `/api/*`
  - Statisk filservice för klienten i produktion
  - Felhantering middleware
  - Lyssnar på alla interfaces (`0.0.0.0`) för LAN-åtkomst

##### Bibliotek

- **`library/env.ts`**: Hantering av miljövariabler med:
  - Automatisk laddning från `.env`-filer
  - Type-safe getters (`envString`, `envNumber`, `envBoolean`)
  - Fallback-värden
- **`library/http.ts`**: HTTP-hjälpfunktioner:
  - `buildUrl`: Bygger query-strängar säkert
  - `fetchJson`: Type-safe JSON-fetch med timeout och felhantering
- **`library/cache.ts`**: Enkel minnescache med TTL för att undvika överflödiga API-anrop.

##### Routes

- **`routes/weather.ts`**: Hämtar väder från Open-Meteo API:
  - Transformerar weather codes till svenska beskrivningar
  - Returnerar aktuellt väder + 48timmars prognos
  - Cacher data enligt `WEATHER_CACHE_MS`
  - Fallback till mock-data vid fel
- **`routes/glucose.ts`**: Integrerar med Nightscout:
  - Hämtar glukosdata med autentisering
  - Beräknar trender, delta-värden
  - Konverterar mg/dL till mmol/L
  - Rate-limiting och hård cache för prestanda
  - Hanterar stale data-varningar
- **`routes/pollen.ts`**: Hämtar pollen från Open-Meteo Air Quality API:
  - Beräknar pollennivåer och rekommendationer
  - Färgkodar efter allvarlighetsgrad
  - Returnerar top 3 pollen-typer

## Installation och körning

### Förutsättningar

- Node.js 18+
- npm eller yarn

### Lokal utveckling

1. **Installera beroenden**:

   ```bash
   cd homescreen/client
   npm install

   cd ../server
   npm install
   ```

2. **Konfigurera miljövariabler**:

   ```bash
   cd homescreen/server
   cp .env.example .env
   # Redigera .env med dina inställningar
   ```

3. **Starta servern**:

   ```bash
   cd homescreen/server
   npm run dev
   # Kör på http://localhost:8080
   ```

4. **Starta klienten** (i nytt terminalfönster):

   ```bash
   cd homescreen/client
   npm run dev
   # Kör på http://localhost:5173
   ```

5. **Öppna webbläsaren**: Gå till `http://localhost:5173`

### Produktion på Raspberry Pi

1. **Bygg klienten**:

   ```bash
   cd homescreen/client
   npm run build
   ```

2. **Bygg servern**:

   ```bash
   cd homescreen/server
   npm run build
   ```

3. **Starta applikationen**:

   ```bash
   cd homescreen/server
   npm start
   ```

4. **Öppna**: `http://<din-pi-ip>:8080`

## Konfiguration

Alla inställningar görs via `.env`-filen i `homescreen/server/`. Kopiera från `.env.example`.

### Platsinställningar (delade)

- `WEATHER_LATITUDE`: Latitud för väder/pollen (default: 58.4108)
- `WEATHER_LONGITUDE`: Longitud för väder/pollen (default: 15.6214)
- `WEATHER_LOCATION_NAME`: Platsnamn (default: "Linköping")

### Väder (Open-Meteo)

- `WEATHER_CACHE_MS`: Cache-tid i ms (default: 600000 = 10 min)

### Glukos (Nightscout)

- `NIGHTSCOUT_URL`: Full URL till din Nightscout-instans
- `NIGHTSCOUT_READ_TOKEN`: Läs-token (om krävs)
- `GLUCOSE_CACHE_MS`: Cache-tid i ms (default: 60000 = 1 min)

### Pollen (Open-Meteo)

- `POLLEN_CACHE_MS`: Cache-tid i ms (default: 3600000 = 1 timme)

### Server

- `PORT`: Port att lyssna på (default: 8080)

## Tekniska detaljer

### Prestandaoptimeringar

- **Caching**: Alla externa API-anrop caches för att minska belastning
- **Rate limiting**: Glukos-endpoint har rate limiting för att skydda Nightscout
- **Lazy loading**: Data hämtas endast när komponenter mountas
- **Minimal re-renders**: Använder Reacts optimeringar och `startTransition`

### Säkerhet

- **CORS**: Endast nödvändiga headers
- **Input validation**: Alla externa data valideras
- **Rate limiting**: Förhindrar överbelastning
- **Miljövariabler**: Känslig data hålls utanför kodbasen

### Felhantering

- **Fallback data**: Mock-data används vid API-fel
- **Graceful degradation**: Appen fortsätter fungera även om en datakälla fallerar
- **Användarfeedback**: Tydliga felmeddelanden och laddningsindikatorer

### UI/UX

- **Responsiv design**: Fungerar på olika skärmstorlekar
- **Mörkt tema**: Lätt på ögonen, energieffektivt
- **Tillgänglighet**: Semantisk HTML, ARIA-labels
- **Animationer**: Smooth transitions och shimmer-laddning

## Felsökning

### Klienten startar inte

- Kontrollera att Node.js är installerat: `node --version`
- Installera beroenden: `npm install` i `homescreen/client`
- Kontrollera portkonflikter

### Servern startar inte

- Kontrollera `.env`-filen finns och är korrekt
- Verifiera att port 8080 är ledig
- Kolla serverlogs för felmeddelanden

### Data visas inte

- Kontrollera nätverksanslutning
- Verifiera API-nycklar/tokens i `.env`
- Kolla browser console för fel
- Testa API-endpoints direkt: `curl http://localhost:8080/api/health`

### Byggfel

- Rensa node_modules: `rm -rf node_modules && npm install`
- Uppdatera beroenden: `npm update`
- Kontrollera TypeScript-fel: `npm run lint`

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
npm run dev      # Starta med ts-node-dev (auto-reload)
npm run build    # Kompilera TypeScript
npm start        # Kör kompilerad kod
```

## Bidrag och utveckling

Projektet är skrivet i TypeScript för typesäkerhet och använder moderna React-mönster. Alla komponenter är funktionella med hooks, och koden är organiserad för enkel underhållbarhet.

För att bidra:

1. Forka projektet
2. Skapa en feature-branch
3. Gör ändringar med TypeScript och ESLint
4. Testa både dev och production builds
5. Skicka pull request

## Licens

ISC License - se package.json för detaljer.
