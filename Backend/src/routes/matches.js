import { Router } from "express";
import { regionToCluster, fetchMatchIds, fetchMatch } from "../services/riotApi.js";

const router = Router();

// GET /api/matches/:region/:puuid
router.get("/:region/:puuid", async (req, res) => {
  const { region, puuid } = req.params;
  const cluster = regionToCluster[region] ?? "europe";

  const ids     = await fetchMatchIds(puuid, cluster);
  const matches = await Promise.all(ids.map((id) => fetchMatch(id, cluster)));

  const filtered = matches.filter(Boolean).map((match) => ({
    metadata: { matchId: match.metadata.matchId },
    info: {
      gameMode:     match.info.gameMode,
      gameDuration: match.info.gameDuration,
      participants: match.info.participants.map((p) => ({
        puuid:                p.puuid,
        win:                  p.win,
        teamId:               p.teamId,
        championName:         p.championName,
        champLevel:           p.champLevel,
        kills:                p.kills,
        deaths:               p.deaths,
        assists:              p.assists,
        totalMinionsKilled:   p.totalMinionsKilled,
        neutralMinionsKilled: p.neutralMinionsKilled,
        visionScore:          p.visionScore,
        summoner1Id:          p.summoner1Id,
        summoner2Id:          p.summoner2Id,
        item0:                p.item0,
        item1:                p.item1,
        item2:                p.item2,
        item3:                p.item3,
        item4:                p.item4,
        item5:                p.item5,
        item6:                p.item6,
        riotIdGameName:       p.riotIdGameName,
        riotIdTagline:        p.riotIdTagline,
        summonerName:         p.summonerName,
        perks: {
          styles: p.perks?.styles?.slice(0, 2).map((s, i) => ({
            style:      s.style,
            selections: i === 0 ? [{ perk: s.selections?.[0]?.perk }] : [],
          })) ?? [],
        },
      })),
    },
  }));

  res.json(filtered);
});

export default router;
