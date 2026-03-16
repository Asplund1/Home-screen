# Home-screen

Dashboard for Raspberry Pi, byggd i React och Express.

## Vad appen visar nu

- Vader fran SMHI
- Glukos fran Nightscout
- Pollenprognos fran Google Pollen API


## Struktur

- `homescreen/client` innehåller React-klienten
- `homescreen/server` innehåller Express-backend och API-integrationer
- `homescreen/server/.env.example` visar all konfiguration som behovs

## Lokal utveckling

1. Installera beroenden i `homescreen/client` och `homescreen/server`
2. Kopiera `homescreen/server/.env.example` till `homescreen/server/.env`
3. Starta servern i `homescreen/server` med `npm run dev`
4. Starta klienten i `homescreen/client` med `npm run dev`

Klienten proxar `/api` till `http://localhost:8080`.

## Produktion pa Raspberry Pi

1. Bygg klienten i `homescreen/client` med `npm run build`
2. Bygg servern i `homescreen/server` med `npm run build`
3. Starta backend i `homescreen/server` med `npm run start`
4. Oppna `http://<din-pi>:8080`

Nar klienten ar byggd serveras `homescreen/client/dist` automatiskt av Express.

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

### Google Pollen API

För riktig pollenprognos:

- sätt `GOOGLE_POLLEN_API_KEY`
- valfritt `POLLEN_LANGUAGE_CODE=sv`

Om Nightscout eller Google Pollen inte är konfigurerat visas demo- eller setup-data i dashboarden.

## Verifierat

- `npm run lint` i `homescreen/client`
- `npm run build` i `homescreen/client`
- `npm run build` i `homescreen/server`
