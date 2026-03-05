# LF12-Projekt
## League of Legends Summoner Webapp
Es sollen über die von Riot Games zur Verfügung gestellten API‑Schnittstellen Informationen von gewünschten Spieleraccounts abgerufen und in einer Webanwendung visualisiert werden. Dafür wird ein Server mit entsprechendem Monitoring bereitgestellt.

## Zeitrahmen
Das Projekt wird im Unterricht des Lernfeldes 12 geplant und durchgeführt. Dafür stehen alle vorgesehenen Unterrichtsstunden vom 26.02.2026 bis zum 06.03.2026 zur Verfügung.

## Organisatorische Rahmenbedingungen
### Projektteam
| **Teammitglied** | **Rolle** |
|--|--|
| Lucas Kloss | Projektleiter |
| Luis Rennert | Systemintegrator |
| Robert Frost | Systemintegrator |
| Justin Mildner | Anwendungsentwickler |

### Organisationsform
Es wird eine reine Projektorganisation eingesetzt. Trotz des kleinen Projektumfangs steht die Autonomie des Teams im Vordergrund. Verantwortlichkeiten können so klar und schnell zugeordnet und Arbeitsabläufe flexibel gestaltet werden.

### Vorgehensmodell
Die Projektorganisation orientiert sich an einem vereinfachten, zeitlich angepassten Scrum‑Ansatz. Die Arbeit erfolgt in kurzen Iterationen, in denen Planung, Umsetzung und Überprüfung eng miteinander verzahnt sind. Zu Beginn jeder Phase werden die anstehenden Aufgaben gemeinsam priorisiert und in einem übersichtlichen Backlog festgehalten. Die Zusammenarbeit erfolgt in kurzen Abstimmungsrunden während der Unterrichtszeiten, um Fortschritt und Hindernisse transparent zu halten und die Dokumentation fortlaufend zu sichern.

## Technische Rahmenbedingung
Das Projekt wird eine externe Hostingumgebung von Hetzner nutzen, um den Server bereitzustellen. Die Server von Hetzner bieten beim Abschluss des Abonnements direkt eine Firewall, die für das Projekt entsprechend den Anforderungen konfiguriert wird. Für die Kommunikation mit der Datenquelle wird die offizielle API von Riot Games verwendet, deren Nutzungsbedingungen und technischen Einschränkungen einzuhalten sind. Die Anwendung soll über eine gesicherte HTTPS‑Verbindung erreichbar sein, wofür ein Zertifikat einer vertrauenswürdigen Zertifizierungsstelle vorgesehen ist. Ein Reverse‑Proxy wird als Bestandteil der Infrastruktur eingeplant, um Routing, Sicherheit und Erreichbarkeit zu gewährleisten.
Für die Überwachung der Systemkomponenten soll Uptime‑Kuma verwendet werden, das im Projekt eingerichtet und konfiguriert wird. Überwacht werden sollen mindestens der Serverbetrieb, die Webanwendung sowie die eingesetzte Datenbank.

## Sicherheits- und Datenschutzbedingungen
Es werden ausschließlich öffentlich zugängliche Daten verarbeitet; dennoch sind grundlegende Datenschutz‑ und Sicherheitsprinzipien wie Datensparsamkeit, Zugriffsbeschränkung und sichere Übertragung einzuhalten. Die Firewall‑Konfiguration des Hosting‑Anbieters darf nur im notwendigen Umfang angepasst werden, um die Erreichbarkeit der Anwendung sicherzustellen.


