# Home-screen

En dashboard-applikation för Raspberry Pi som visar väder, tunnelbaneavgångar och en digital klocka i ett enkelt gränssnitt. Projektet är uppdelat i en React-klient och en Express-backend.

## Vad appen visar

- **Väder**: Aktuellt väder, temperatur, nederbörd, vind och soluppgång/solnedgång från Open-Meteo
- **Tunnelbana**: Avgångar från SL med destination, spår och avgångstid
- **Klocka**: Digital klocka som uppdateras varje minut

## Projektstruktur

```text
Home-screen/
+-- README.md
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

### Backend

- Express med TypeScript
- Exponerar API-endpoints för väder, tunnelbana och hälsokontroll
- Cacherar externa svar för att minska belastning
- Servar den byggda klienten i produktion om `client/dist` finns

## API

- `GET /api/health` - hälsokontroll
- `GET /api/weather` - väderdata
- `GET /api/subway` - tunnelbaneavgångar

## Installation och utveckling

### Förutsättningar

- Node.js 18+
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

Klienten körs på `http://localhost:5173` och servern på `http://localhost:8080`.

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

Tunnelbanan är för närvarande hårdkodad till Råcksta station i serverns SL-adapter.

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
