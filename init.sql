CREATE TABLE IF NOT EXISTS favorites (
    id            SERIAL PRIMARY KEY,
    summoner_name VARCHAR(100) NOT NULL,
    region        VARCHAR(10)  NOT NULL,
    puuid         VARCHAR(100) UNIQUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);