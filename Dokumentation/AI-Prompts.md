# KI Prompts von SysInt2 (Luis Rennert)
## Genutzte KI: Claude Sonnet 4.6

### Prompt 1
Wir sind eine 4er Gruppe die im Rahmen der Ausbildung zum Fachinformatiker im LF12 Projektmanagement ein Praxisprojekt durchführen sollen mit Lasten, Pflichtenheft und allem drum und dran. Wir tuen uns aber gerade schwer ein geeignetes Thema zu finden. Unsere Gruppe besteht aus einem Entwickler, einem Projektleiter und zwei Systemintegratoren. Die Interessen von uns sind: Gameentwicklung, Webanwendungen, Automatisierung, Netzwerke, Infrastruktur. Das ist nur eine Gedankenstütze und wir haben auch nur eine Woche Zeit dafür. Kannst du uns helfen ein Thema zu finden?

#### Antwort auf Prompt 1:

Uns wurden 3 verschiedene Projekte vorgeschlagen. Eine der Ideen war es eine TODO Webapp bereitzustellen. Unsere Gruppe fand das Grundprinzip eine Webapp in einem Projekt gemeinsam zu entwickeln/bereitzustellen, aber mit einer anderen Hauptfunktion. Im Endeffekt haben wir uns dafür entschieden eine Webapp zu bauen die Statistiken über das Videospiel "League of Legends" bereitstellt.

### Prompt 2:

Ich habe bisher noch nie eine Docker Compose geschrieben. Kannst du mir dabei helfen.

#### Antwort auf Prompt 2:

Antwort war eine kleine Beispiel Docker-compose. 
Danach habe ich nochmal ein Video geschaut: https://www.youtube.com/watch?v=DM65_JyGxCo

### Prompt 3:

Kannst du mir bitte Github Actions erklären. Ich habe noch nie damit gearbeitet

#### Antwort auf Prompt 3:

Antwort war eine Beispiel deploy.yml mit einer Grundstruktur zum Code auschecken. 
Danach Video angeschaut: https://www.youtube.com/watch?v=R8_veQiYBjI

### Prompt 4:

Kannst du mir helfen meine nginx.conf für unser Projekt anzupassen:

events {}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}

#### Antwort auf Prompt 4:

Nachdem ich dieses Video geschaut habe: https://www.youtube.com/watch?v=q8OleYuqntY, um die erste deploy.yml zu schreiben, hat Claude die Datei so angepasst:

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
