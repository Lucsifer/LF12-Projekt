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
### 3.2.1 Use‑Case 1: Summoner suchen
**Akteur:** Nutzer 

**Ziel:** Ein Summoner‑Profil anhand eines Namens abrufen

**Auslöser:** Nutzer gibt einen Summoner‑Namen ein

**Vorbedingungen:**
- Die Webanwendung ist erreichbar
- Der Nutzer hat Zugriff auf das Suchfeld

**Nachbedingungen:** 
- Summoner‑Daten wurden angezeigt oder eine Fehlermeldung wurde ausgegeben

**Hauptszenario:**
1. Nutzer öffnet die Webanwendung.
2. Nutzer gibt einen Summoner‑Namen in das Suchfeld ein.
3. System prüft die Eingabe auf Gültigkeit.
4. System sendet eine Anfrage an das Backend.
5. Backend ruft die Daten über die Riot‑API ab.
6. Backend verarbeitet die Daten und gibt sie an das Frontend zurück.
7. System zeigt die Summoner‑Daten an.
8. System speichert den Summoner im Last‑Viewed‑Cache.

**Alternativszenario:**
- A1: Summoner existiert nicht → Fehlermeldung „Summoner nicht gefunden“
- A2: Netzwerkfehler → Fehlermeldung „Server nicht erreichbar“

### 3.2.2 Use‑Case 2: Summoner‑Daten anzeigen
**Akteur:** Nutzer 

**Ziel:** Summoner‑Profilinformationen einsehen

**Vorbedingungen:**
- Summoner‑Daten wurden erfolgreich geladen

**Nachbedingungen:** 
- Daten sind sichtbar und strukturiert dargestellt

**Hauptszenario:**
1. System erhält Summoner‑Daten vom Backend.
2. System zeigt Profilinformationen (Name, Level, Icon) an.
3. System zeigt Ranginformationen an.
4. System zeigt Statistiken an.
5. Nutzer kann Favoriten‑Button sehen.

**Alternativszenario:**
- A1: Einzelne Daten fehlen → System zeigt „Keine Daten verfügbar“

### 3.2.3 Use‑Case 3: Summoner als Favorit speichern
**Akteur:** Nutzer 

**Ziel:** Ein Summoner‑Profil dauerhaft speichern

**Vorbedingungen:**
- Summoner‑Daten sind geladen
- Favoritenfunktion ist verfügbar

**Nachbedingungen:** 
- Summoner ist in der Favoritenliste gespeichert

**Hauptszenario:**
1. Nutzer klickt auf „Favorisieren“.
2. System prüft, ob Summoner bereits gespeichert ist.
3. System speichert Summoner im lokalen Speicher oder in der Datenbank.
4. System bestätigt die Speicherung.

**Alternativszenario:**
- A1: Summoner bereits in Favoriten → Meldung „Bereits gespeichert“
- A2: Speicherfehler → Meldung „Favorit konnte nicht gespeichert werden“

### 3.2.4 Use‑Case 4: Favoritenliste anzeigen
**Akteur:** Nutzer 

**Ziel:** Gespeicherte Summoner schnell aufrufen

**Vorbedingungen:**
- Favoriten werden angezeigt

**Nachbedingungen:** 
- Summoner ist in der Favoritenliste gespeichert

**Hauptszenario:**
1. Nutzer öffnet Favoritenliste.
2. System lädt gespeicherte Favoriten.
3. System zeigt die Liste an.
4. Nutzer wählt einen Favoriten aus.
5. System lädt das Profil wie in Use‑Case 1.

**Alternativszenario:**
- A1: Keine Favoriten vorhanden → Meldung „Keine Favoriten gespeichert“

### 3.2.5 Use‑Case 5: Letzten Summoner automatisch laden
**Akteur:** Nutzer 

**Ziel:** Schnell auf zuletzt angesehenes Profil zugreifen

**Vorbedingungen:**
- Ein Summoner wurde zuvor erfolgreich geladen

**Nachbedingungen:** 
- Letzter Summoner wird angezeigt

**Hauptszenario:**
1. Nutzer öffnet die Webanwendung.
2. System prüft den Last‑Viewed‑Cache.
3. System lädt den gespeicherten Summoner.
4. System zeigt die Daten ohne API‑Abfrage an.

**Alternativszenario:**
- A1: Kein Cache vorhanden → System zeigt Startseite ohne Daten

### 3.2.6 Use‑Case 6: Infrastruktur überwachen
**Akteur:** Administrator

**Ziel:** Überblick über den Zustand der Infrastruktur erhalten

**Auslöser:** Admin möchte prüfen, ob alle Komponenten funktionieren

**Vorbedingungen:**
- Uptime‑Kuma ist installiert und konfiguriert
- Admin hat Zugriff auf das Dashboard

**Nachbedingungen:** 
- Admin kennt den aktuellen Zustand aller überwachten Komponenten

**Hauptszenario:**
1. Admin öffnet das Uptime‑Kuma‑Dashboard.
2. System zeigt den Status von Server, Webanwendung und Datenbank an.
3. Admin prüft die Statusanzeigen.
4. Admin erkennt eventuelle Störungen oder Ausfälle.

**Alternativszenario:**
- A1: Monitoring nicht erreichbar → System zeigt Fehlerseite
- A2: Einzelne Komponenten melden Fehler → Admin erhält Status „offline“

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
- Summoner‑Name (Text).
- Auswahl eines Favoriten aus einer Liste.

### 5.2 Ausgabedaten
- Summoner‑Profilinformationen (Name, Level, Icon).
- Ranginformationen (z. B. Solo/Duo, Flex).
- Statistiken (z. B. Anzahl Spiele, Wins/Losses – je nach API‑Umfang).
- Fehlermeldungen (Text).
- Monitoring‑Status (z. B. „online“, „offline“).

### 5.3 Datenquellen
- Riot‑Games‑API als externe Datenquelle.
- Lokaler Cache (z. B. Browser‑Storage) für Favoriten und letzten Summoner.
- Datenbank auf dem Server für persistente Speicherung.

## 6. Nicht-funktionale Anforderungen
### 6.1 Sicherheit
- Alle Verbindungen zur Webanwendung erfolgen über HTTPS.
- Der API‑Key wird ausschließlich serverseitig verwaltet und nicht im Client offengelegt.
- Die Firewall des Hosting‑Anbieters ist nach dem Prinzip der minimalen Öffnung konfiguriert.

### 6.2 Performance
- Die Antwortzeit bei einer regulären Summoner‑Abfrage soll im Normalfall unter 2 Sekunden liegen.
- Durch Caching des zuletzt aufgerufenen Summoners werden unnötige API‑Anfragen vermieden.

### 6.3 Zuverlässigkeit
- Uptime‑Kuma überwacht die Kernkomponenten und zeigt Ausfälle an.
- Der Server ist so konfiguriert, dass Dienste bei einem Neustart automatisch wieder gestartet werden.

### 6.4 Usability
- Die Benutzeroberfläche ist übersichtlich und intuitiv bedienbar.
- Wichtige Informationen sind klar strukturiert und ohne technische Vorkenntnisse verständlich.
- Die Anwendung ist auf gängigen Bildschirmgrößen gut nutzbar.

### 6.5 Wartbarkeit
- Der Quellcode ist strukturiert und kommentiert.
- Konfigurationen (z. B. API‑Key, Endpoints) sind zentral verwaltet.

## 7. Systemmodelle
### 7.1 Architekturmodell
Die Architektur folgt einem klassischen Web‑Anwendungsmodell. Der Nutzer greift mit einem Browser auf die Webanwendung zu. Die Anfrage wird zunächst vom Reverse‑Proxy entgegengenommen, der sie an das Backend weiterleitet. Das Backend kommuniziert mit der Riot‑Games‑API, verarbeitet die Antworten und stellt die Daten dem Frontend zur Verfügung.
Optional kann eine Datenbank angebunden werden, um Favoriten oder Caching‑Informationen zu speichern. Uptime‑Kuma läuft als separates System bzw. Dienst und überwacht die Erreichbarkeit der relevanten Komponenten.

### 7.2 GUI-Beschreibung
- **Startseite:** Suchfeld für Summoner‑Namen, ggf. Anzeige des zuletzt aufgerufenen Summoners.
- **Ergebnisansicht:** Anzeige von Profilinformationen, Rang und Statistiken, Button zum Favorisieren.
- **Favoritenansicht:** Liste gespeicherter Summoner‑Profile mit Möglichkeit zum direkten Aufruf.
- **Fehleransicht:** Anzeige von Fehlermeldungen bei Problemen.
