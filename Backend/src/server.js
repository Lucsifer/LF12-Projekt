import "dotenv/config";
import express from "express";
import cors from "cors";

import summonerRouter from "./routes/summoner.js";
import rankedRouter   from "./routes/ranked.js";
import matchesRouter  from "./routes/matches.js";
import favoritesRouter from "./routes/favorites.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/summoner",  summonerRouter);
app.use("/api/ranked",    rankedRouter);
app.use("/api/matches",   matchesRouter);
app.use("/api/favorites", favoritesRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on port ${PORT}`));
