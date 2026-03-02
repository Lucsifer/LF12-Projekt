# Frontend Dokumentation

## Setup

Das Projekt wurde mit folgendem Befehl erstellt:

```bash
cd LF12-Projekt
npx create-next-app@latest lf12-frontend --js --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-git
```

**Was die Flags bedeuten:**
| Flag | Bedeutung |
|---|---|
| `--js` | JavaScript (kein TypeScript) |
| `--tailwind` | Tailwind CSS wird automatisch eingerichtet |
| `--eslint` | ESLint (Codequalität) wird eingerichtet |
| `--app` | App Router (modernes Next.js Routing) |
| `--no-src-dir` | Kein extra `src/`-Ordner |
| `--import-alias "@/*"` | Kurze Imports wie `@/components/...` |
| `--no-git` | Kein neues Git-Repo (wir haben schon eins) |

---

## Starten

```bash
cd lf12-frontend
npm install       # einmalig nach git clone
npm run dev       # Entwicklungsserver starten
```

Browser: **http://localhost:3000**

---

## Installierte Pakete

| Paket | Zweck |
|---|---|
| `next` | Next.js Framework (React + Routing + SSR) |
| `react` / `react-dom` | React |
| `tailwindcss` | CSS Utility Framework |
| `@tailwindcss/postcss` | Tailwind PostCSS Plugin |
| `eslint` | Code Linting |

---

## Wichtige Dateien

| Datei/Ordner | Bedeutung |
|---|---|
| `app/page.js` | Startseite (`/`) |
| `app/layout.js` | Grundlayout für alle Seiten |
| `app/globals.css` | Globale CSS (Tailwind Imports) |
| `next.config.mjs` | Next.js Konfiguration |
| `package.json` | Abhängigkeiten & npm Scripts |

---

## Empfohlene VS Code Extensions

- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **ES7+ React/Redux Snippets** (`dsznajder.es7-react-js-snippets`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
