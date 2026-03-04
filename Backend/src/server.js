import "dotenv/config";
import express from "express";
import cors from "cors";

import summonerRouter  from "./routes/summoner.js";
import rankedRouter    from "./routes/ranked.js";
import matchesRouter   from "./routes/matches.js";
import favoritesRouter from "./routes/favorites.js";
import { cache }       from "./middleware/cache.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/summoner",  cache(300), summonerRouter);
app.use("/api/ranked",    cache(300), rankedRouter);
app.use("/api/matches",   cache(120), matchesRouter);
app.use("/api/favorites", favoritesRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on port ${PORT}`));
