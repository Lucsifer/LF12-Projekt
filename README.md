# LF12-Projekt
## League of Legends Summoner Webapp
Es soll über die von Riot Games zur Verfügung gestellten API-Schnittstellen, Informationen von gewüschten spieleraccount abgerufen werden und in einer Webanwendung zur Visualisiert werden.
Dafür wird ein Server ein Server bereitgestellt mit entsprechendem Monitoring.

## Zeitrahmen
Das Projekt wird im Unterricht des Lernfeldes 12 geplant und durchgeführt. Dafür stehen alle vorgesehenen Unterichtsstunde vom 26.02.2026 bis zum 06.03.2026 zur verfügung.

## Organisatorische Rahmenbedingungen
### Projektteam
| **Teammitglied** | **Rolle** |
| Lucas Kloss | Projektleiter |
| Luis Rennert | Systemintegrator |
| Robert Frost | Systemintegrator |
| Justin Miltner | Anwendungsentwickler |

## Technische Rahmenbedingung
Das Projekt wird eine externe Hostingumgebung von Hetzner nutzen, um den Server bereitzustellen. Die Server von Hetzner bieten beim abschluss des Abonemoents direkt eine Firewall mit, welche für das Projekt den Anforderungen entsprechen konfigurert wird. Für die Kommunikation mit der Datenquelle wird die offizielle API von Riot Games verwendet, deren Nutzungsbedingungen und technischen Limitierungen einzuhalten sind. Die Anwendung soll über eine gesicherte HTTPS‑Verbindung erreichbar sein, wofür ein Zertifikat einer vertrauenswürdigen Zertifizierungsstelle vorgesehen ist. Ein Reverse‑Proxy wird als Bestandteil der Infrastruktur eingeplant, um Routing, Sicherheit und Erreichbarkeit zu gewährleisten.
Für die Überwachung der Systemkomponenten soll Uptime-Kuma verwendet werden, welches im Projekt eingerichtet und konfiguriert werden soll. Überwacht werden sollen mindestens der Serverbetrieb, die Webanwendung sowie die eingesetzte Datenbank.

