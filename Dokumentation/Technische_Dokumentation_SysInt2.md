# Technische Dokumentation – Systemintegration
## LF12 Projekt – Riot API Dashboard

**Autor:** Luis Rennert
**Datum:** März 2026  
**Projekt:** Automatisiertes Deployment einer Riot API Webanwendung mit CI/CD Pipeline

---

## 1. Projektübersicht

Im Rahmen von LF12 wurde eine Webanwendung entwickelt, die Spielerdaten über die Riot Games API abruft und darstellt. Die Infrastruktur wurde vollständig containerisiert und über eine automatisierte CI/CD Pipeline deployed.

Diese Dokumentation beschreibt die Aufgaben und Konfigurationen des Systemintegrators 2 (Luis Rennert), bestehend aus:

- Docker Compose Setup
- Konfiguration der Container (PostgreSQL, Redis, Nginx, Uptime Kuma)
- Datenbankinitialisierung mit init.sql
- Nginx Webserver Konfiguration
- CI/CD Pipeline mit GitHub Actions

---

## 2. Architekturübersicht

```
Internet
    │
    ▼
Nginx (Host) ← Reverse Proxy, HTTPS/Let's Encrypt
    │
    ▼
Nginx (Docker) ← Webserver, Port 81
    ├── /          → Frontend (statische Next.js Dateien)
    └── /api/      → Backend (Express, Port 4000)
                        ├── PostgreSQL (Port 5432) ← Favoritenliste
                        └── Redis (Port 6379)      ← API Cache
```

---

## 3. Docker Compose

Die `docker-compose.yml` definiert alle Services der Anwendung. Sensible Zugangsdaten werden über eine `.env` Datei eingebunden, die nicht in Git eingecheckt wird.

### 3.1 Vollständige docker-compose.yml

```yaml
services:
  backend:
    build: ./Backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379
      - RIOT_API_KEY=${RIOT_API_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:latest
    ports:
      - "81:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - backend

  uptime-kuma:
    image: louislam/uptime-kuma:1
    ports:
      - "6969:3001"
    volumes:
      - uptime_kuma_data:/app/data
    restart: always

volumes:
  postgres_data:
  redis_data:
  uptime_kuma_data:
```

### 3.2 Erklärung der Services

| Service | Image | Aufgabe |
|---|---|---|
| backend | Eigener Build | Express API, Port 4000 |
| postgres | postgres:16 | Relationale Datenbank für Favoriten |
| redis | redis:7 | In-Memory Cache für API Antworten |
| nginx | nginx:latest | Webserver & interner Reverse Proxy |
| uptime-kuma | louislam/uptime-kuma:1 | Monitoring Dashboard |

### 3.3 Kommunikation zwischen Containern

Alle Container laufen im selben Docker Netzwerk (`riotapp_default`) und erreichen sich gegenseitig über den Service-Namen statt einer IP-Adresse:

- Backend → PostgreSQL: `postgresql://postgres:5432`
- Backend → Redis: `redis://redis:6379`
- Nginx → Backend: `http://backend:4000`

![alt text](image.png)

### 3.4 Umgebungsvariablen (.env)

```env
POSTGRES_USER=user
POSTGRES_PASSWORD=sicherespasswort
POSTGRES_DB=riotapp
RIOT_API_KEY=RGAPI-xxxx-xxxx-xxxx
```

Die `.env` Datei wird in `.gitignore` eingetragen und nie in Git eingecheckt. Eine `.env.example` ohne echte Werte wird stattdessen eingecheckt.

---

## 4. Datenbankinitialisierung (init.sql)

Die `init.sql` wird beim ersten Start des PostgreSQL Containers automatisch ausgeführt. Sie legt die benötigte Tabelle an für die Favoritenliste.

```sql
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    summoner_name VARCHAR(100) NOT NULL,
    region VARCHAR(10) NOT NULL,
    puuid VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Wichtig:** Die `init.sql` wird nur beim allerersten Start ausgeführt, wenn das Volume noch leer ist. Bei späteren Änderungen muss das Volume gelöscht werden (`docker compose down -v`) oder die Änderung manuell ausgeführt werden.

---

## 5. Nginx Konfiguration

### 5.1 Docker Nginx (Webserver)

Die `nginx.conf` konfiguriert den Nginx Container als Webserver für das statische Next.js Frontend.

```nginx
events {}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri.html $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Erklärung der wichtigsten Direktiven:**

- `try_files $uri $uri.html $uri/ /index.html` – SPA-Routing für Next.js, leitet unbekannte Pfade an die index.html weiter
- `location /api/` – Leitet alle API Anfragen intern an das Backend weiter
- `expires 1y` – Statische Assets werden ein Jahr lang im Browser gecacht

### 5.2 Host Nginx (Reverse Proxy)

Der Host Nginx läuft direkt auf dem Hetzner Server außerhalb von Docker und ist zuständig für HTTPS und die Weiterleitung an den Docker Nginx. Dieser wurde von SysInt1 bereitgestellt.

---

## 6. CI/CD Pipeline (GitHub Actions)

Die Pipeline wird bei jedem Push auf den `main` Branch automatisch ausgelöst oder kann manuell über `workflow_dispatch` gestartet werden.

### 6.1 deploy.yml

```yaml
name: Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Code auschecken
        uses: actions/checkout@v3

      - name: Frontend bauen
        run: |
          cd frontend
          npm install
          npm run build

      - name: .env Datei erstellen
        run: |
          echo "POSTGRES_USER=${{ secrets.POSTGRES_USER }}" >> .env
          echo "POSTGRES_PASSWORD=${{ secrets.POSTGRES_PASSWORD }}" >> .env
          echo "POSTGRES_DB=${{ secrets.POSTGRES_DB }}" >> .env
          echo "RIOT_API_KEY=${{ secrets.RIOT_API_KEY }}" >> .env

      - name: .git Ordner entfernen
        run: rm -rf .git

      - name: Dateien auf Server kopieren
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "."
          target: "/opt/riotapp"
          overwrite: true

      - name: Docker Compose starten
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/riotapp
            docker compose pull
            docker compose up -d --build
```

### 6.2 Ablauf der Pipeline

1. Code wird vom Repository ausgecheckt
2. Next.js Frontend wird gebaut (`npm run build` erzeugt `frontend/dist`(hier legt next.js alle statischen Dateien ab))
3. `.env` Datei wird aus GitHub Secrets erstellt
4. `.git` Ordner wird entfernt (nicht benötigt auf dem Server)
5. Alle Dateien werden per SCP auf den Server kopiert
6. Docker Compose startet alle Container neu

### 6.3 GitHub Secrets

Folgende Secrets müssen in GitHub unter `Settings → Secrets and Variables → Actions` hinterlegt werden:

| Secret | Inhalt |
|---|---|
| `POSTGRES_USER` | Datenbankbenutzer |
| `POSTGRES_PASSWORD` | Datenbankpasswort |
| `POSTGRES_DB` | Datenbankname |
| `RIOT_API_KEY` | Riot Games API Key |
| `SSH_HOST` | IP-Adresse des Hetzner Servers |
| `SSH_USER` | SSH Benutzername |
| `SSH_PRIVATE_KEY` | Privater SSH Key für GitHub Actions |

---

## 7. Monitoring (Uptime Kuma)

Uptime Kuma überwacht alle Services und schlägt Alarm wenn ein Dienst nicht erreichbar ist.

Erreichbar unter: `http://SERVER_IP:6969`

### Konfigurierte Monitore

| Monitor    | Typ      | Host                | Port |
| ------------| ----------| ---------------------| ------|
| Frontend   | HTTP     | http://SERVER_IP:81 | –    |
| Backend    | HTTP     | http://backend:4000 | –    |
| PostgreSQL | TCP Port | postgres            | 5432 |
| Redis      | TCP Port | redis               | 6379 |

Da Uptime Kuma im selben Docker Netzwerk läuft, können PostgreSQL und Redis über den Service-Namen direkt überwacht werden ohne die Ports nach außen zu öffnen.

---

## 8. Deployment Anleitung

### Erstmaliges Deployment

```bash
# 1. Docker auf dem Server installieren
sudo apt update
sudo apt install docker.io docker-compose-plugin -y

# 2. Projektordner anlegen
sudo mkdir -p /opt/riotapp
sudo chown -R $USER:$USER /opt/riotapp
sudo chmod -R 755 /opt/riotapp

# 3. GitHub Secrets hinterlegen (in GitHub selbst)

# 4. Pipeline manuell starten oder auf main pushen
```

### Erneutes Deployment

Bei jedem Push auf `main` läuft die Pipeline automatisch durch und deployed die neue Version.

### Nützliche Befehle

```bash
# Container Status prüfen
docker compose ps

# Logs anschauen
docker compose logs backend
docker compose logs nginx

# Datenbank prüfen
docker compose exec postgres psql -U user -d riotapp -c "\dt"

# Redis prüfen
docker compose exec redis redis-cli ping

# Redis live monitoren
docker compose exec redis redis-cli monitor

# Alle Container neu starten
docker compose down
docker compose up -d
```
