# Home-screen

En dashboard-applikation för Raspberry Pi som visar väder, tunnelbanetidtabeller, pollenprognoser och en digital klocka i ett enkelt gränssnitt. Projektet är uppdelat i en React-klient och en Express-backend.

## Vad appen visar

- **Väder**: Aktuellt väder, temperatur, nederbörd, vind och soluppgång/solnedgång från Open-Meteo
- **Tunnelbana**: Avgångar från SL med destination och avgångstid
- **Pollen**: Aktuella pollennivåer från Open-Meteo med färgkodad sammanfattning
- **Klocka**: Digital klocka som uppdateras varje minut

## Projektstruktur

```text
Home-screen/
├── package.json
├── README.md
└── homescreen/
    ├── client/
    │   ├── package.json
    │   ├── index.html
    │   ├── vite.config.ts
    │   └── src/
    │       ├── App.tsx
    │       ├── main.tsx
    │       ├── theme.ts
    │       ├── components/
    │       ├── hooks/
    │       ├── library/
    │       ├── sections/
    │       └── types/
    └── server/
        ├── package.json
        ├── tsconfig.json
        ├── .env.example
        └── src/
            ├── index.ts
            ├── library/
            └── routes/
```

## Arkitektur

### Frontend

- React 19 med TypeScript
- Material UI för layout och styling
- Vite för utveckling och produktionbyggnad
- Pollar backend via `/api/*` för att hålla UI uppdaterad

### Backend

- Express med TypeScript
- Exponerar API-endpoints för väder, pollen, tunnelbana och hälsokontroll
- Cacherar externa svar för att minska belastning
- Servar den byggda klienten i produktion

## API

- `GET /api/health` – hälsokontroll
- `GET /api/weather` – väderdata
- `GET /api/pollen` – pollenprognoser
- `GET /api/subway` – tunnelbanaavgångar

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

Klienten körs då på `http://localhost:5173` och servern på `http://localhost:8080`.

### 4. Bygg för produktion

```bash
cd homescreen/client
npm run build

cd ../server
npm run build
```

## Konfiguration

Miljövariablerna finns i `homescreen/server/.env`.

### Delade inställningar

- `PORT` – port för servern (standard: `8080`)
- `LOCATION_LATITUDE` – latitud för platsen
- `LOCATION_LONGITUDE` – longitud för platsen
- `LOCATION_NAME` – platsnamn

### Väder och pollen

- `WEATHER_CACHE_MS` – cache-tid för väderdata
- `POLLEN_LANGUAGE_CODE` – språk för pollenbeskrivningar
- `POLLEN_CACHE_MS` – cache-tid för pollendata

### Tunnelbana

- `SL_API_KEY` – API-nyckel för SL-datatjänst (om krävs)

## Felsökning

- Kontrollera att Node.js är installerat: `node --version`
- Installera beroenden om appen inte startar: `npm install`
- Kontrollera att `.env` finns och att porten `8080` inte är upptagen

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
