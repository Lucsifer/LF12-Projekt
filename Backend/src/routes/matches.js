import { Router } from "express";
import { regionToCluster, fetchMatchIds, fetchMatch } from "../services/riotApi.js";

const router = Router();

// GET /api/matches/:region/:puuid
router.get("/:region/:puuid", async (req, res) => {
  const { region, puuid } = req.params;
  const cluster = regionToCluster[region] ?? "europe";

  const ids     = await fetchMatchIds(puuid, cluster);
  const matches = await Promise.all(ids.map((id) => fetchMatch(id, cluster)));

  res.json(matches.filter(Boolean));
});

export default router;
