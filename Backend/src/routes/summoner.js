import { Router } from "express";
import {
  regionToCluster,
  fetchAccount,
  fetchSummoner,
  fetchDDragonVersion,
  fetchChampionIdMap,
  fetchTopMastery,
  normalizeChampionName,
} from "../services/riotApi.js";

const router = Router();

// GET /api/summoner/:region/:name/:tag
router.get("/:region/:name/:tag", async (req, res) => {
  const { region, name, tag } = req.params;
  const gameName = decodeURIComponent(name);
  const tagLine  = decodeURIComponent(tag);
  const cluster  = regionToCluster[region] ?? "europe";

  const account = await fetchAccount(gameName, tagLine, cluster);
  if (!account) return res.status(404).json({ error: "Player not found" });

  const [summoner, version] = await Promise.all([
    fetchSummoner(account.puuid, region),
    fetchDDragonVersion(),
  ]);

  const champMap = await fetchChampionIdMap(version);
  const mastery  = await fetchTopMastery(account.puuid, region);

  let splashUrl = null;
  if (mastery?.[0]) {
    const champName = champMap[mastery[0].championId];
    if (champName) {
      splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${normalizeChampionName(champName)}_0.jpg`;
    }
  }

  res.json({
    gameName:       account.gameName,
    tagLine:        account.tagLine,
    puuid:          account.puuid,
    summonerId:     summoner?.id ?? null,
    level:          summoner?.summonerLevel ?? "?",
    iconUrl:        summoner
      ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`
      : null,
    ddragonVersion: version,
    splashUrl,
  });
});

export default router;
