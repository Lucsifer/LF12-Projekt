# Pflichtenheft – League of Legends Summoner Webapp
## 1. Zielbestimmung
### 1.1 Muss-Kriterien
- Die Webanwendung muss Summoner‑Daten über die offizielle Riot‑Games‑API abrufen können.
- Die Anwendung muss die wichtigsten Spielerinformationen (z. B. Name, Level, Rang, grundlegende Statistiken) anzeigen.
- Die Anwendung muss eine Favoritenfunktion bereitstellen, mit der Summoner‑Profile gespeichert und erneut aufgerufen werden können.
- Die Anwendung muss den zuletzt aufgerufenen Summoner cachen, sodass dieser ohne erneute API‑Abfrage wieder angezeigt werden kann.
- Die Anwendung muss über eine HTTPS‑gesicherte Verbindung erreichbar sein.
- Ein Reverse‑Proxy muss für Routing und Absicherung der Webanwendung eingesetzt werden.
- Uptime‑Kuma muss mindestens den Serverbetrieb, die Webanwendung und die eingesetzte Datenbank überwachen.
- Fehlerhafte Eingaben, API‑Fehler und Erreichbarkeitsprobleme müssen durch verständliche Fehlermeldungen behandelt werden.

### 1.2 Wunsch-Kriterien
- Die Benutzeroberfläche soll responsiv sein und auf mobilen Endgeräten gut nutzbar sein.
- Es sollen erweiterte Statistiken (z. B. Champion‑Mastery, Match‑History‑Auszüge, Itembuilds, gewählte Runen und Mitspieler in den einzelnen Games) angezeigt werden können.
- Im Monitoring sollen optionale Benachrichtigungen bei Ausfällen oder Störungen konfigurierbar sein.

### 1.3 Abgrenzungskriterien
- Es wird kein Benutzer‑Login‑ oder Authentifizierungssystem implementiert.
- Es werden keine privaten oder nicht öffentlich zugänglichen Daten verarbeitet.
- Es werden keine In‑Game‑Daten verändert oder beeinflusst.
- Es wird kein eigenes Ranking‑ oder Bewertungssystem für Spieler implementiert.

## 2. Produkteinsatz
### 2.1 Anwendungsbereiche
Die Webanwendung wird eingesetzt, um öffentlich zugängliche League‑of‑Legends‑Summoner‑Profile schnell und übersichtlich einzusehen. Sie dient dazu, Spielerinformationen und grundlegende Statistiken abzurufen, Profile zu vergleichen und bestimmte Summoner als Favoriten zu markieren. Die Anwendung wird ausschließlich im Browser genutzt und erfordert keine lokale Installation.

### 2.2 Zielgruppen
Die primäre Zielgruppe sind League‑of‑Legends‑Spieler, die ihre eigenen oder fremde Profile einsehen und beobachten möchten. Sekundäre Zielgruppen sind interessierte Personen, die Statistiken analysieren wollen, sowie die Projektbeteiligten, die die technische Infrastruktur und das Monitoring verwalten.

### 2.3 Betriebsbedingungen
Die Anwendung wird auf einem Hetzner‑Cloud‑Server betrieben, der dauerhaft mit dem Internet verbunden ist. Für den Zugriff wird ein aktueller Webbrowser mit aktivem JavaScript benötigt. Die Kommunikation mit der Riot‑API setzt eine funktionierende Internetverbindung und einen gültigen API‑Key voraus. Der Betrieb erfolgt unter Linux mit konfigurierter Firewall, Reverse‑Proxy und HTTPS‑Zertifikat.

## 3. Produktübersicht
### 3.1 Systemüberblick
Die Webanwendung besteht aus einem Frontend, das im Browser des Nutzers läuft, und einem Backend, das auf dem Hetzner‑Server betrieben wird. Das Frontend ermöglicht die Eingabe von Summoner‑Namen, die Anzeige von Profilinformationen, die Verwaltung von Favoriten sowie den Zugriff auf den zuletzt aufgerufenen Summoner.
Das Backend nimmt Anfragen vom Frontend entgegen, kommuniziert mit der Riot‑Games‑API, verarbeitet die Antworten und stellt die Daten dem Frontend strukturiert zur Verfügung. Ein Reverse‑Proxy übernimmt das Routing der Anfragen und sorgt für eine sichere und saubere Trennung der Komponenten. Uptime‑Kuma überwacht die Erreichbarkeit des Servers, der Webanwendung und der Datenbank (falls eingesetzt) und stellt den Status in einem Dashboard dar.

### 3.2 Use-Cases

## 4. Produktfunktionen
### 4.1 Summoner-Suche
- Eingabe eines Summoner‑Namens über ein Suchfeld.
- Validierung der Eingabe (z. B. leere Eingabe verhindern).
- Weiterleitung der Anfrage an das Backend zur Verarbeitung.

### 4.2 API-Abfrage und Datenverabeitung
- Aufbau einer Anfrage an die Riot‑Games‑API mit dem angegebenen Summoner‑Namen.
- Verarbeitung der API‑Antwort und Extraktion relevanter Daten (Profil, Rang, Statistiken).
- Behandlung von Fehlercodes (z. B. Summoner nicht gefunden, Rate‑Limit erreicht).

### 4.3 Datenanzeige
- Darstellung von Summoner‑Name, Level, Profilbild und Ranginformationen.
- Anzeige ausgewählter Statistiken in einer übersichtlichen Struktur.
- Klare Trennung von Basisinformationen und optionalen Detailinformationen.

### 4.4 Favoriten-System
- Möglichkeit, ein angezeigtes Summoner‑Profil als Favorit zu markieren.
- Speicherung der Favoriten (z. B. lokal im Browser oder in einer Datenbank).
- Anzeige einer Favoritenliste, aus der Summoner direkt ausgewählt werden können.
- Möglichkeit, Favoriten wieder zu entfernen.

### 4.5 Last-Viewed-Cache
- Automatisches Speichern des zuletzt angezeigten Summoner‑Profils.
- Beim erneuten Aufruf der Anwendung wird der zuletzt betrachtete Summoner ohne erneute API‑Abfrage angezeigt.
- Aktualisierung des Caches, sobald ein neuer Summoner erfolgreich geladen wurde.

### 4.6 Fehlerbehandlung
- Anzeige einer verständlichen Meldung bei ungültigen Summoner‑Namen.
- Anzeige einer Meldung bei Nichterreichbarkeit der Riot‑API oder des eigenen Backends.
- Anzeige einer Meldung bei Überschreitung von API‑Limits.

### 4.7 Monitoring
- Uptime‑Kuma überwacht die Erreichbarkeit des Servers.
- Uptime‑Kuma überwacht die Erreichbarkeit der Webanwendung.
- Uptime‑Kuma überwacht die Erreichbarkeit der Datenbank.

### 4.8 Sicherheitsfunktionen
- Erzwingen der Nutzung von HTTPS.
- Sicherer Umgang mit dem Riot‑API‑Key (keine Ausgabe im Frontend, keine Hardcodierung im Client).
- Nutzung einer Firewall, die nur notwendige Ports (z. B. 80/443) öffnet.

## 5. Produktdaten
### 5.1 Eingabedaten
