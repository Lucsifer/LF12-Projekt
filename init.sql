CREATE TABLE IF NOT EXISTS favorites (
    id         SERIAL PRIMARY KEY,
    game_name  VARCHAR(100) NOT NULL,
    tag_line   VARCHAR(50)  NOT NULL,
    region     VARCHAR(10)  NOT NULL,
    puuid      VARCHAR(100) UNIQUE NOT NULL,
    icon_url   VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);