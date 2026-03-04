const API_KEY = process.env.RIOT_API_KEY;

export const regionToCluster = {
  euw1: "europe",
  eun1: "europe",
  na1:  "americas",
  br1:  "americas",
  kr:   "asia",
  jp1:  "asia",
};

const championNameFixes = {
  FiddleSticks: "Fiddlesticks",
};

export function normalizeChampionName(name) {
  return championNameFixes[name] ?? name;
}

export async function fetchAccount(gameName, tagLine, cluster) {
  const res = await fetch(
    `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { headers: { "X-Riot-Token": API_KEY } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSummoner(puuid, region) {
  const res = await fetch(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
    { headers: { "X-Riot-Token": API_KEY } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchDDragonVersion() {
  const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versions = await res.json();
  return versions[0];
}

export async function fetchChampionIdMap(version) {
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );
  const data = await res.json();
  return Object.fromEntries(
    Object.values(data.data).map((c) => [parseInt(c.key), c.id])
  );
}

export async function fetchTopMastery(puuid, region) {
  const res = await fetch(
    `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=1`,
    { headers: { "X-Riot-Token": API_KEY } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchRankedEntries(puuid, region) {
  const res = await fetch(
    `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
    { headers: { "X-Riot-Token": API_KEY } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchMatchIds(puuid, cluster, count = 20) {
  const res = await fetch(
    `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
    { headers: { "X-Riot-Token": API_KEY } }
  );
  console.log("matchIds status:", res.status); 
  if (!res.ok) return [];
  return res.json();
}

export async function fetchMatch(matchId, cluster) {
  const res = await fetch(
    `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    { headers: { "X-Riot-Token": API_KEY } }
  );
  if (!res.ok) return null;
  return res.json();
}
