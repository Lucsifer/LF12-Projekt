# LF12 Projekt – Dokumentation

## Projektübersicht

Eine Web-Applikation zur Abfrage von League of Legends Spielerprofilen.
Der Nutzer kann Spieler nach Name und Region suchen, deren Ranked-Stats, Match-Historie und Champion-Daten einsehen sowie Spieler als Favoriten speichern.

---

## Techstack

### Frontend
| Technologie | Version | Zweck |
|---|---|---|
| **Next.js** | 16.1.6 | React Framework (App Router, SSR/CSR) |
| **React** | 19.2.3 | UI Komponenten |
| **Tailwind CSS** | 4 | Utility-First CSS Styling |
| **ESLint** | 9 | Code-Qualität |

### Backend
| Technologie | Version | Zweck |
|---|---|---|
| **Node.js** | – | JavaScript Laufzeitumgebung |
| **Express** | 4.18 | HTTP Server & Routing |
| **dotenv** | 16.3 | Umgebungsvariablen laden |
| **pg** | 8.11 | PostgreSQL Client |
| **redis** | 4.6 | Redis Client für Caching |
| **cors** | 2.8 | Cross-Origin Requests erlauben |

### Infrastruktur
| Technologie | Zweck |
|---|---|
| **Docker / Docker Compose** | Containerisierung aller Services |
| **PostgreSQL 16** | Persistente Datenspeicherung (Favoriten) |
| **Redis 7** | API-Response Caching |
| **Nginx** | Statisches Frontend ausliefern (Production) |
| **Uptime Kuma** | Server-Monitoring |
| **GitHub Actions** | CI/CD – automatischer Deploy bei Push auf `main` |

### Externe APIs
| API | Zweck |
|---|---|
| **Riot Games API** | Spielerdaten, Ranked-Stats, Match-Historie |
| **Data Dragon (DDragon)** | Champion-Bilder, Items, Runen, Spell-Icons |

---

## Architektur

```
Browser
  │
  ├── Next.js Frontend (Port 3000 lokal / Nginx Port 81 Production)
  │     ├── Suchseite (/)
  │     └── Spielerprofil (/summoner?region=&name=&tag=)
  │
  └── Express Backend (Port 4000)
        ├── Redis Cache (Port 6379)
        ├── PostgreSQL (Port 5432)
        └── Riot Games API (extern)
```

**Datenfluss bei einer Spielersuche:**
1. Nutzer gibt `Name#Tag` + Region ein → Frontend navigiert zu `/summoner`
2. Frontend sendet `GET /api/summoner/:region/:name/:tag` ans Backend
3. Backend fragt Redis → Cache HIT → sofort zurück
4. Cache MISS → Backend fragt Riot API (Account + Summoner + Mastery)
5. Antwort wird in Redis gespeichert (TTL 300s) und ans Frontend gesendet
6. Frontend lädt parallel Ranked und Matches (`Promise.all`)
7. DDragon-Daten (Spells, Runen) werden direkt vom Browser geladen

---

## Projektstruktur

```
LF12-Projekt/
├── frontend/                    # Next.js App
│   ├── app/
│   │   ├── page.js              # Suchseite (/)
│   │   ├── layout.js            # Root Layout
│   │   ├── globals.css          # Tailwind Imports
│   │   ├── summoner/
│   │   │   └── page.js          # Spielerprofil-Seite
│   │   └── assets/
│   │       └── ranked-emblem/   # Rang-Embleme (PNG)
│   ├── .env.local               # Lokale Umgebungsvariablen
│   └── package.json
│
├── backend/
│   └── src/
│       ├── server.js            # Express-Einstiegspunkt
│       ├── routes/
│       │   ├── summoner.js      # GET /api/summoner/:region/:name/:tag
│       │   ├── ranked.js        # GET /api/ranked/:region/:puuid
│       │   ├── matches.js       # GET /api/matches/:region/:puuid
│       │   └── favorites.js     # CRUD /api/favorites
│       ├── services/
│       │   ├── riotApi.js       # Riot API Hilfsfunktionen
│       │   ├── db.js            # PostgreSQL Connection Pool
│       │   └── redis.js         # Redis Client
│       └── middleware/
│           └── cache.js         # Redis-Cache Middleware
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD
├── docker-compose.yml           # Alle Services
├── init.sql                     # PostgreSQL Schema
└── nginx.conf                   # Nginx Konfiguration
```

---

## Backend – API Endpunkte

### Summoner
```
GET /api/summoner/:region/:name/:tag
```
Gibt Spielerprofil zurück: Name, Tag, PUUID, Level, Profilbild-URL, Champion-Splash-URL, DDragon-Version.
Intern: Riot Account API → Summoner API → Champion Mastery API.

---

### Ranked
```
GET /api/ranked/:region/:puuid
```
Gibt Ranked-Einträge zurück (Solo/Duo + Flex): Tier, Division, LP, Wins, Losses.

---

### Matches
```
GET /api/matches/:region/:puuid
```
Gibt die letzten 20 Matches zurück. Die Riot-Antwort wird gefiltert – es werden nur die Felder übertragen, die das Frontend tatsächlich benötigt (reduziert Datenmenge deutlich).

**Gefilterte Felder pro Teilnehmer:** `puuid`, `win`, `teamId`, `championName`, `champLevel`, `kills`, `deaths`, `assists`, `totalMinionsKilled`, `neutralMinionsKilled`, `visionScore`, `summoner1Id`, `summoner2Id`, `item0–6`, `riotIdGameName`, `riotIdTagline`, `perks` (Keystone + Sekundärstil).

---

### Favorites
```
GET    /api/favorites          → Alle Favoriten abrufen
POST   /api/favorites          → Favorit hinzufügen
DELETE /api/favorites/:id      → Favorit entfernen
```

**POST Body:**
```json
{
  "game_name": "Faker",
  "tag_line":  "T1",
  "region":    "kr",
  "puuid":     "...",
  "icon_url":  "https://ddragon.../profileicon/123.png"
}
```

---

## Redis Caching

Die Cache-Middleware (`cache.js`) wird auf Summoner, Ranked und Matches-Routen angewendet:

```js
app.use("/api/summoner", cache(300), summonerRouter);  // 5 Minuten
app.use("/api/ranked",   cache(300), rankedRouter);    // 5 Minuten
app.use("/api/matches",  cache(120), matchesRouter);   // 2 Minuten
```

**Cache-Key:** `cache:/api/summoner/euw1/Faker/T1` (komplette URL)

**Log-Ausgaben:**
```
[Cache] HIT  /api/summoner/euw1/Faker/T1   → Aus Redis, kein Riot API Call
[Cache] MISS /api/summoner/euw1/Faker/T1   → Riot API wird abgefragt, Ergebnis gespeichert
[Cache] SKIP (Redis not connected) /api/… → Redis nicht verfügbar, kein Caching
```

Wenn `REDIS_URL` nicht gesetzt ist (z.B. lokal), wird Redis komplett übersprungen.

---

## Datenbank – PostgreSQL Schema

```sql
CREATE TABLE IF NOT EXISTS favorites (
    id         SERIAL PRIMARY KEY,
    game_name  VARCHAR(100) NOT NULL,
    tag_line   VARCHAR(50)  NOT NULL,
    region     VARCHAR(10)  NOT NULL,
    puuid      VARCHAR(100) UNIQUE NOT NULL,
    icon_url   VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

`puuid` ist `UNIQUE` – ein Spieler kann nicht doppelt favorisiert werden (`ON CONFLICT DO NOTHING`).

---

## Umgebungsvariablen

### Frontend (`frontend/.env.local`)
| Variable | Beispiel | Beschreibung |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend-URL |

### Backend (`backend/.env`)
| Variable | Beispiel | Beschreibung |
|---|---|---|
| `RIOT_API_KEY` | `RGAPI-...` | Riot Games API Key (läuft alle 24h ab) |
| `PORT` | `4000` | Backend Port |
| `REDIS_URL` | `redis://localhost:6379` | Redis Verbindung (optional lokal) |
| `DATABASE_URL` | `postgresql://user:pw@host/db` | PostgreSQL Verbindung |

> **Hinweis:** Im Docker-Compose wird `REDIS_URL=redis://redis:6379` direkt gesetzt (interner Docker-Netzwerkname). `DATABASE_URL` wird aus `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` zusammengebaut.

---

## Docker Compose – Services

| Service | Image | Port | Beschreibung |
|---|---|---|---|
| `backend` | Custom Build | 4000 | Express API Server |
| `postgres` | postgres:16 | 5432 | Datenbank (Favoriten) |
| `redis` | redis:7 | 6379 | Response-Cache |
| `nginx` | nginx:latest | 81 | Frontend ausliefern |
| `uptime-kuma` | louislam/uptime-kuma:1 | 6969 | Monitoring Dashboard |

---

## CI/CD – GitHub Actions

Bei jedem Push auf `main` wird automatisch deployed:

1. **Frontend bauen** – `npm install && npm run build`
2. **`.env` erstellen** – aus GitHub Secrets
3. **`.git` entfernen** – vor dem Upload
4. **Dateien auf Server kopieren** – via SCP nach `/opt/riotapp`
5. **Docker Compose starten** – `docker compose up -d --build`

### Benötigte GitHub Secrets
| Secret | Beschreibung |
|---|---|
| `SSH_HOST` | IP-Adresse des Servers |
| `SSH_USER` | SSH-Benutzername |
| `SSH_PRIVATE_KEY` | SSH Private Key |
| `RIOT_API_KEY` | Riot API Key |
| `POSTGRES_USER` | PostgreSQL Benutzername |
| `POSTGRES_PASSWORD` | PostgreSQL Passwort |
| `POSTGRES_DB` | PostgreSQL Datenbankname |

---

## Lokale Entwicklung

### Voraussetzungen
- Node.js 18+
- npm

### Backend starten
```bash
cd backend
npm install
npm run dev        # startet mit --watch (auto-reload)
```

### Frontend starten
```bash
cd frontend
npm install
npm run dev
```

Browser: **http://localhost:3000**
Backend: **http://localhost:4000**

> Redis und PostgreSQL werden lokal **nicht** benötigt – das Backend fällt graceful zurück (kein Caching, keine Favoriten-Persistenz).

---

## Frontend – Seiten & Komponenten

### `app/page.js` – Suchseite
- Suchfeld für `Name#Tag` + Region-Dropdown
- Favoriten-Liste aus dem Backend (Schnellzugriff per Klick)
- Navigation zu `/summoner?region=...&name=...&tag=...`

### `app/summoner/page.js` – Spielerprofil
Aufgeteilt in mehrere lokale Komponenten:

| Komponente | Beschreibung |
|---|---|
| `SummonerPage` | Wrapper mit `<Suspense>` für `useSearchParams()` |
| `SummonerContent` | Hauptkomponente – lädt alle Daten, verwaltet State |
| `RankCard` | Zeigt Rang-Emblem, Tier, LP, Winrate (Donut-Chart via SVG) |
| `PlayerRow` | Eine Zeile im ausgeklappten Team-Scoreboard |

**State in `SummonerContent`:**
| State | Typ | Beschreibung |
|---|---|---|
| `summoner` | Object | Spielerprofil-Daten |
| `ranked` | Array | Solo/Duo und Flex Einträge |
| `matches` | Array | Letzte 20 Matches |
| `spellMap` | Object | `spellId → spellName` (für DDragon URLs) |
| `runeMap` | Object | `runeId → iconPath` (für DDragon URLs) |
| `expanded` | Set | Ausgeklappte Match-IDs |
| `favorites` | Array | Alle gespeicherten Favoriten |
| `favLoading` | Boolean | Ladestate beim Favorit-Toggle |

---

## Setup – Erstinstallation

### Projekt erstellt mit:
```bash
npx create-next-app@latest frontend --js --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-git
```

| Flag | Bedeutung |
|---|---|
| `--js` | JavaScript (kein TypeScript) |
| `--tailwind` | Tailwind CSS automatisch einrichten |
| `--eslint` | ESLint einrichten |
| `--app` | App Router (modernes Next.js Routing) |
| `--no-src-dir` | Kein extra `src/`-Ordner |
| `--import-alias "@/*"` | Kurze Imports wie `@/components/...` |
| `--no-git` | Kein neues Git-Repo |

---

## Empfohlene VS Code Extensions

- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **ES7+ React/Redux Snippets** (`dsznajder.es7-react-js-snippets`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
