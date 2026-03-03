import { Router } from "express";
import { cache } from "../middleware/cache.js";
import { fetchRankedEntries } from "../services/riotApi.js";

const router = Router();

// GET /api/ranked/:region/:puuid
router.get("/:region/:puuid", cache(300), async (req, res) => {
  const { region, puuid } = req.params;
  const data = await fetchRankedEntries(puuid, region);
  res.json(data);
});

export default router;
