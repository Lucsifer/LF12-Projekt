# Server

Die Server spezifikationen beziehen sich auf 2vCPUs und 4GB Arbeitsspeicher auf einem Hetzner CX23

IP: 46.225.218.94

## Docker installation

(https://docs.docker.com/engine/install/ubuntu/)

Docker apt repo einrichten

```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

Docker pakete installieren

```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose
```

## Gruppe und Geteilter Ordner

Der Gruppenordner ist gedacht für alle entwicklungen und dass jeder zugriff auf die Projektdaten hat

```bash
# Group for Project
sudo groupadd project_devs

# Folder for Projekt
sudo mkdir -p /srv/league-project
sudo chown :project_devs /srv/league-project

# Owner can Read,Write,Execute
# Group can Read,Write,Execute
# Others can Read and Execute
# The 2 before 775 is making the setgid-bit ensuring every new file is automatically belonging to the project_devs group
sudo chmod 2775 /srv/league-project
```

## User erstellen

Die drei Nutzer anlegen, wobei die jeweiligen nutzer bestehen
lukulus, iszshara, spargel1337, lucsifer

```bash
# Create the user
sudo adduser lucsifer

# Add them to the shared project group
sudo usermod -aG project_devs lucsifer

# Add them to the docker group so they don't need 'sudo' for docker commands
sudo usermod -aG docker lucsifer
```

## Rollenbasierte Policies für den Entwickler

```bash
sudo visudo
# Allow Developer to restart the reverse proxy
spargel1337 ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
```

## Nginx Reverse Proxy

1. Nginx auf dem Host installieren
`sudo apt install nginx`
nach aufrufen der Serverip:80 sollte der Nginx willkommens-screen gezeigt werden.

2. Selbst signiertes Zertifikat erstellen.
`sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /etc/ssl/private/nginx-selfsigned.key \
-out /etc/ssl/certs/nginx-selfsigned.crt`

```txt
key:value
Country Name:DE
State or Province:Saxony
Locality:Dresden
Organization:LF-Droelf
Organization unit:
Common Name:<server-ip>
Email:
```
### Nginx für Pfad-Basiertes routen verwenden

```bash
# Edit Config
sudo vim /etc/nginx/sites-available/league-project
```

!# Konfiguration pasten

```bash
# Enable Configuration
sudo ln -s /etc/nginx/sites-available/league-project /etc/nginx/sites-enabled/
# Check syntax
sudo nginx -t
# Restart nginx
sudo systemctl restart nginx.service
# "Unload" default config file
sudo rm /etc/nginx/sites-available/default
sudo nginx -t # Test is successfull
```