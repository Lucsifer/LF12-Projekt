// Region (euw1, na1 ...) → Riot API Cluster (europe, americas, asia)
const regionToCluster = {
  euw1: "europe",
  eun1: "europe",
  na1:  "americas",
  br1:  "americas",
  kr:   "asia",
  jp1:  "asia",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get("gameName");
  const tagLine  = searchParams.get("tagLine");
  const region   = searchParams.get("region") ?? "euw1";

  if (!gameName || !tagLine) {
    return Response.json({ error: "gameName and tagline are mandatory" }, { status: 400 });
  }

  const cluster = regionToCluster[region] ?? "europe";
  const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

  const res = await fetch(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
  });

  if (!res.ok) {
    return Response.json({ error: "player not found" }, { status: res.status });
  }

  const data = await res.json();
  // { puuid, gameName, tagLine }
  return Response.json(data);
}
