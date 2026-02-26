# LF12-Projekt
## League of Legends Summoner Webapp
Es soll über die von Riot Games zur Verfügung gestellten API-Schnittstellen, Informationen von gewüschten spieleraccount abgerufen werden und in einer Webanwendung zur Visualisiert werden.
Dafür wird ein Server ein Server bereitgestellt mit entsprechendem Monitoring.

## Zeitrahmen
Das Projekt wird im Unterricht des Lernfeldes 12 geplant und durchgeführt. Dafür stehen alle vorgesehenen Unterichtsstunde vom 26.02.2026 bis zum 06.03.2026 zur verfügung.

## Organisatorische Rahmenbedingungen
### Projektteam
| **Teammitglied** | **Rolle** |
|--|--|
| Lucas Kloss | Projektleiter |
| Luis Rennert | Systemintegrator |
| Robert Frost | Systemintegrator |
| Justin Miltner | Anwendungsentwickler |

### Organisationsform
Es wird eine reine Projektorganisation eingesetzt werden, trotz des kleinen Projektumfangs steht die Autonomie des Teams im Vordergrund. Verantwortlichkeiten können so klar und schnell zugeordnet und Arbeitsabläufe flexibel gestaltet werden.

### Vorgehensmodell
Die Projektorganisation orientiert sich an einem vereinfachten, zeitlich angepassten Scrum‑Ansatz. Die Arbeit erfolgt in kurzen Iterationen, in denen Planung, Umsetzung und Überprüfung eng miteinander verzahnt sind. Zu Beginn jeder Phase werden die anstehenden Aufgaben gemeinsam priorisiert und in einem übersichtlichen Backlog festgehalten. Die Zusammenarbeit erfolgt in kurzen Abstimmungsrunden während der Unterrichtszeiten, um Fortschritt und Hindernisse transparent zu halten und die Dokumentation fortlaufend zu sichern.

## Technische Rahmenbedingung
Das Projekt wird eine externe Hostingumgebung von Hetzner nutzen, um den Server bereitzustellen. Die Server von Hetzner bieten beim abschluss des Abonemoents direkt eine Firewall mit, welche für das Projekt den Anforderungen entsprechen konfigurert wird. Für die Kommunikation mit der Datenquelle wird die offizielle API von Riot Games verwendet, deren Nutzungsbedingungen und technischen Limitierungen einzuhalten sind. Die Anwendung soll über eine gesicherte HTTPS‑Verbindung erreichbar sein, wofür ein Zertifikat einer vertrauenswürdigen Zertifizierungsstelle vorgesehen ist. Ein Reverse‑Proxy wird als Bestandteil der Infrastruktur eingeplant, um Routing, Sicherheit und Erreichbarkeit zu gewährleisten.
Für die Überwachung der Systemkomponenten soll Uptime-Kuma verwendet werden, welches im Projekt eingerichtet und konfiguriert werden soll. Überwacht werden sollen mindestens der Serverbetrieb, die Webanwendung sowie die eingesetzte Datenbank.

## Sicherheits- und Datenschutzbedingungen
Es werden ausschließlich öffentlich zugängliche Daten verarbeitet; dennoch sind grundlegende Datenschutz‑ und Sicherheitsprinzipien wie Datensparsamkeit, Zugriffsbeschränkung und sichere Übertragung einzuhalten. Die Firewall‑Konfiguration des Hosting‑Anbieters darf nur im notwendigen Umfang angepasst werden, um die Erreichbarkeit der Anwendung sicherzustellen.


