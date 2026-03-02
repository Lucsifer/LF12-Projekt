import Image from "next/image";
import Link from "next/link";
import { regionToCluster } from "@/lib/regions";

async function getSummoner(gameName, tagLine, region) {
  const cluster = regionToCluster[region] ?? "europe";
  const apiKey  = process.env.RIOT_API_KEY;

  try {
    // 1. Fetch account by Riot ID → returns puuid
    const accountRes = await fetch(
      `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { "X-Riot-Token": apiKey }, cache: "no-store" }
    );
    if (!accountRes.ok) return null;
    const account = await accountRes.json();

    // 2. Fetch summoner by PUUID → returns level, icon ID and summonerId
    const summonerRes = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
      { headers: { "X-Riot-Token": apiKey }, cache: "no-store" }
    );
    if (!summonerRes.ok) return { ...account, level: "?", iconUrl: null };
    const summoner = await summonerRes.json();

    // 3. Get latest Data Dragon version for icon URLs
    // No cache: "no-store" here — version only changes on patch days (~2 weeks)
    const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions    = await versionsRes.json();
    const version     = versions[0];

    // 4. Fetch champion list to map champion IDs → names
    // The mastery endpoint only returns championId, not championName
    const champDataRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );
    const champData      = await champDataRes.json();
    const championIdToName = Object.fromEntries(
      Object.values(champData.data).map(c => [parseInt(c.key), c.id])
    );

    // 5. Fetch top mastery champion → used as profile background splash art
    const masteryRes = await fetch(
      `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top?count=1`,
      { headers: { "X-Riot-Token": apiKey }, cache: "no-store" }
    );
    let splashUrl = null;
    if (masteryRes.ok) {
      const mastery      = await masteryRes.json();
      const championName = championIdToName[mastery[0]?.championId];
      console.log("[Splash] id:", mastery[0]?.championId, "name:", championName);
      if (championName) {
        splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${normalizeChampionName(championName)}_0.jpg`;
        console.log("[Splash] url:", splashUrl);
      }
    }

    return {
      gameName:       account.gameName,
      tagLine:        account.tagLine,
      puuid:          account.puuid,
      summonerId:     summoner.id,
      level:          summoner.summonerLevel,
      iconUrl:        `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`,
      ddragonVersion: version,
      splashUrl,
    };
  } catch {
    // Network error, timeout, or unexpected failure
    return null;
  }
}

async function getMatchHistory(puuid, cluster) {
  const apiKey = process.env.RIOT_API_KEY;

  try {
    // 1. Fetch last 10 match IDs for this player
    const idsRes = await fetch(
      `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
      { headers: { "X-Riot-Token": apiKey }, cache: "no-store" }
    );
    if (!idsRes.ok) return [];
    const matchIds = await idsRes.json();

    // 2. Fetch details for each match ID in parallel
    const matches = await Promise.all(
      matchIds.map(id =>
        fetch(
          `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}`,
          { headers: { "X-Riot-Token": apiKey }, cache: "no-store" }
        ).then(r => r.json())
      )
    );

    return matches;
  } catch {
    return [];
  }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatGameMode(mode) {
  const modes = {
    CHERRY:    "Arena",
    CLASSIC:   "Summoner's Rift",
    ARAM:      "ARAM",
    URF:       "URF",
    ONEFORALL: "One for All",
  };
  // If the mode is not known then it displays the raw one
  return modes[mode] ?? mode;
}

// Riot API champion names that don't match DDragon filenames
const championNameFixes = {
  FiddleSticks: "Fiddlesticks",
};

function normalizeChampionName(name) {
  return championNameFixes[name] ?? name;
}

function championIconUrl(version, championName) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${normalizeChampionName(championName)}.png`;
}

// Single player row inside a match card
function PlayerRow({ player, version, isSelf }) {
  const name = player.riotIdGameName || player.summonerName || "Unknown";
  const kda  = `${player.kills}/${player.deaths}/${player.assists}`;

  return (
    <div className={`flex items-center gap-2 rounded-lg px-2 py-1 ${isSelf ? "bg-blue-500/20 ring-1 ring-blue-500/50" : ""}`}>
      <Image
        src={championIconUrl(version, player.championName)}
        alt={player.championName}
        width={24}
        height={24}
        className="rounded-sm"
      />
      <span className={`truncate text-sm w-28 ${isSelf ? "font-semibold text-white" : "text-slate-300"}`}>
        {name}
      </span>
      <span className="text-xs text-slate-400 font-mono ml-auto">{kda}</span>
    </div>
  );
}

export default async function SummonerPage({ params }) {
  const { region, name, tag } = await params;
  const gameName = decodeURIComponent(name);
  const tagLine  = decodeURIComponent(tag);

  const data = await getSummoner(gameName, tagLine, region);

  if (!data) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 text-white">
        <p className="text-red-400 text-xl">Player not found</p>
        <Link href="/" className="mt-4 text-blue-400 hover:underline">← Back to Search</Link>
      </main>
    );
  }

  const cluster = regionToCluster[region] ?? "europe";
  const matches = await getMatchHistory(data.puuid, cluster);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-slate-950 py-16 text-white">

      {/* Background glow blobs */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-700/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-4xl px-4">

        {/* Profile card */}
        <div className="overflow-hidden rounded-2xl border border-slate-700/50">

          {/* Splash art banner */}
          <div className="relative overflow-hidden bg-slate-900">
            {data.splashUrl && (
              <Image
                src={data.splashUrl}
                alt="Champion splash art"
                width={1215}
                height={717}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            )}
            {/* Gradient only at the bottom edge so the splash art stays visible */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-slate-800" />
          </div>

          {/* Profile content */}
          <div className="bg-slate-800/90 px-10 pb-10 text-center backdrop-blur-sm">
            {data.iconUrl && (
              <Image
                src={data.iconUrl}
                alt="Profile Icon"
                width={110}
                height={110}
                className="mx-auto -mt-14 rounded-full border-4 border-blue-500 ring-4 ring-slate-800"
              />
            )}
            <h1 className="mt-4 text-3xl font-bold">
              {data.gameName}
              <span className="text-slate-400">#{data.tagLine}</span>
            </h1>
            <p className="mt-2 text-slate-400">Level {data.level}</p>
          </div>

        </div>

        {/* Match history */}
        <h2 className="mt-10 mb-4 text-lg font-semibold text-slate-300">Recent Matches</h2>

        <div className="flex flex-col gap-4">
          {matches.length === 0 && (
            <p className="text-slate-500">No matches found.</p>
          )}

          {matches.map((match) => {
            const participants = match.info?.participants;
            if (!participants) return null;

            const player = participants.find(p => p.puuid === data.puuid);
            if (!player) return null;

            const won      = player.win;
            const team1    = participants.filter(p => p.teamId === 100);
            const team2    = participants.filter(p => p.teamId === 200);
            const team1Won = team1[0]?.win ?? false;

            return (
              <div
                key={match.metadata.matchId}
                className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
                  won ? "border-green-700/50" : "border-red-700/50"
                }`}
              >
                {/* Match header */}
                <div className={`flex items-center justify-between px-5 py-3 ${
                  won ? "bg-green-900/30" : "bg-red-900/30"
                }`}>
                  <div className="flex items-center gap-4">
                    {/* Champion icon of searched player */}
                    <Image
                      src={championIconUrl(data.ddragonVersion, player.championName)}
                      alt={player.championName}
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${won ? "text-green-400" : "text-red-400"}`}>
                          {won ? "WIN" : "LOSS"}
                        </span>
                        <span className="text-slate-400 text-sm">{formatGameMode(match.info.gameMode)}</span>
                      </div>
                      <p className="text-white font-semibold">{player.championName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-semibold text-lg">
                      {player.kills}
                      <span className="text-slate-500"> / </span>
                      <span className="text-red-400">{player.deaths}</span>
                      <span className="text-slate-500"> / </span>
                      {player.assists}
                    </p>
                    <p className="text-xs text-slate-400">{formatDuration(match.info.gameDuration)}</p>
                  </div>
                </div>

                {/* Players — two teams side by side */}
                <div className="grid grid-cols-2 gap-px bg-slate-700/30 px-4 py-3">

                  {/* Team 1 */}
                  <div className="pr-3">
                    <p className={`text-xs font-semibold mb-2 ${team1Won ? "text-green-400" : "text-red-400"}`}>
                      {team1Won ? "Victory" : "Defeat"}
                    </p>
                    <div className="flex flex-col gap-1">
                      {team1.map(p => (
                        <PlayerRow
                          key={p.puuid}
                          player={p}
                          version={data.ddragonVersion}
                          isSelf={p.puuid === data.puuid}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="pl-3 border-l border-slate-700/50">
                    <p className={`text-xs font-semibold mb-2 ${!team1Won ? "text-green-400" : "text-red-400"}`}>
                      {!team1Won ? "Victory" : "Defeat"}
                    </p>
                    <div className="flex flex-col gap-1">
                      {team2.map(p => (
                        <PlayerRow
                          key={p.puuid}
                          player={p}
                          version={data.ddragonVersion}
                          isSelf={p.puuid === data.puuid}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        <Link href="/" className="mt-8 inline-block text-sm text-blue-400 hover:underline">
          ← Back to Search
        </Link>

      </div>
    </main>
  );
}
