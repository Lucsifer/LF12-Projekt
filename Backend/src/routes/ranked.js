import { Router } from "express";
import { fetchRankedEntries } from "../services/riotApi.js";

const router = Router();

// GET /api/ranked/:region/:puuid
router.get("/:region/:puuid", async (req, res) => {
  const { region, puuid } = req.params;
  const data = await fetchRankedEntries(puuid, region);
  res.json(data);
});

export default router;
