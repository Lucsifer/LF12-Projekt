# Pflichtenheft – League of Legends Summoner Webapp
## Einleitung
Das Projekt „League of Legends Summoner Webapp“ hat das Ziel, eine Webanwendung zu entwickeln, die öffentlich zugängliche Summoner‑Daten über die offizielle Riot‑Games‑API abruft und benutzerfreundlich darstellt. Die Anwendung wird auf einem externen Server bei Hetzner betrieben und durch ein Monitoring‑System überwacht. Das Projekt wird im Rahmen des Lernfeldes 12 durchgeführt.

## Zielsetzung
Die Webanwendung soll Nutzern ermöglichen, über die Eingabe eines Summoner‑Namens relevante Spielerinformationen wie Rang, Profilstatus und ausgewählte Statistiken abzurufen. Die Daten sollen übersichtlich visualisiert und über eine gesicherte HTTPS‑Verbindung bereitgestellt werden. Der Serverbetrieb, die Webanwendung und die Datenbank sollen durch Uptime‑Kuma überwacht werden.

## funktionale Anforderungen
- Summoner‑Suche: Eingabe eines Summoner‑Namens über ein Webformular.

- API‑Abfrage: Abruf der Summoner‑Daten über die Riot‑Games‑API.

- Datenanzeige: Darstellung von Profilinformationen, Rang, Level und ausgewählten Statistiken.

- Fehlerbehandlung: Ausgabe verständlicher Fehlermeldungen bei:
   - ungültigen Summoner‑Namen
   - API‑Limitierungen
   - Serverfehlern
- Monitoring: Anzeige der Systemzustände (Server, Webanwendung, Datenbank) über Uptime‑Kuma.
- HTTPS‑Bereitstellung: Zugriff auf die Webapp ausschließlich über eine gesicherte Verbindung.
- Reverse‑Proxy‑Routing: Weiterleitung der Anfragen über einen Reverse‑Proxy.

## Nicht‑funktionale Anforderungen
Sicherheit:
- HTTPS‑Verschlüsselung
- sichere Speicherung des API‑Keys
- Firewall‑Regeln nach dem Prinzip der minimalen Öffnung
Performance:
- Antwortzeiten unter 2 Sekunden bei normalen API‑Anfragen
- effiziente Nutzung der Riot‑API‑Limits
Zuverlässigkeit:
- Monitoring aller Kernkomponenten
- automatische Benachrichtigungen bei Ausfällen (optional)
Usability:
- übersichtliche Benutzeroberfläche
- responsive Darstellung auf Desktop und mobilen Geräten
Wartbarkeit:
- klar strukturierter Code
- dokumentierte Konfigurationen

## Systemarchitektur
**Hosting:** Hetzner‑Cloud‑Server (Linux‑basiert)
**Reverse‑Proxy:** Nginx oder vergleichbare Lösung
**Backend:** z. B. Node.js, Python oder PHP
**Frontend:** HTML, CSS, JavaScript
**Datenbank:** optional (z. B. für Caching)
**Monitoring:** Uptime‑Kuma (Docker oder direkt installiert)
**Zertifikate:** Let’s Encrypt oder andere CA

