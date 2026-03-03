import Image from "next/image";
import Link from "next/link";
import { regionToCluster } from "@/lib/regions";

import emblemIron        from "@/app/assets/ranked-emblem/emblem-iron.png";
import emblemBronze      from "@/app/assets/ranked-emblem/emblem-bronze.png";
import emblemSilver      from "@/app/assets/ranked-emblem/emblem-silver.png";
import emblemGold        from "@/app/assets/ranked-emblem/emblem-gold.png";
import emblemPlatinum    from "@/app/assets/ranked-emblem/emblem-platinum.png";
import emblemDiamond     from "@/app/assets/ranked-emblem/emblem-diamond.png";
import emblemMaster      from "@/app/assets/ranked-emblem/emblem-master.png";
import emblemGrandmaster from "@/app/assets/ranked-emblem/emblem-grandmaster.png";
import emblemChallenger  from "@/app/assets/ranked-emblem/emblem-challenger.png";

const tierEmblems = {
  IRON:        emblemIron,
  BRONZE:      emblemBronze,
  SILVER:      emblemSilver,
  GOLD:        emblemGold,
  PLATINUM:    emblemPlatinum,
  DIAMOND:     emblemDiamond,
  MASTER:      emblemMaster,
  GRANDMASTER: emblemGrandmaster,
  CHALLENGER:  emblemChallenger,
};

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
    console.log("[Summoner] raw:", JSON.stringify(summoner));

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

async function getRankedStats(puuid, region) {
  const apiKey = process.env.RIOT_API_KEY;
  console.log("[Ranked] puuid:", puuid, "| region:", region);
  try {
    const res = await fetch(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": apiKey }, cache: "no-store" }
    );
    console.log("[Ranked] HTTP status:", res.status);
    if (!res.ok) {
      const errText = await res.text();
      console.error("[Ranked] Error body:", errText);
      return [];
    }
    const data = await res.json();
    console.log("[Ranked] entries:", JSON.stringify(data));
    return data;
  } catch (e) {
    console.error("[Ranked] fetch threw:", e);
    return [];
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

const tierColors = {
  IRON:        "text-slate-400",
  BRONZE:      "text-amber-600",
  SILVER:      "text-slate-300",
  GOLD:        "text-yellow-400",
  PLATINUM:    "text-teal-300",
  EMERALD:     "text-emerald-400",
  DIAMOND:     "text-blue-300",
  MASTER:      "text-purple-400",
  GRANDMASTER: "text-red-400",
  CHALLENGER:  "text-cyan-300",
};

function capitalizeTier(tier) {
  return tier ? tier[0] + tier.slice(1).toLowerCase() : "";
}

// SVG donut pie chart: green = wins, red = losses, percentage in center
function WinRatePie({ wins, losses }) {
  const total = wins + losses;
  if (total === 0) return null;

  const winPct = Math.round((wins / total) * 100);
  const angle  = (wins / total) * 360;

  // Full win edge case
  if (angle >= 360) {
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <circle cx="50" cy="50" r="40" fill="#22c55e" />
        <circle cx="50" cy="50" r="26" fill="#1e293b" />
        <text x="50" y="47" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">{winPct}%</text>
        <text x="50" y="59" textAnchor="middle" fontSize="7" fill="#94a3b8">Win Rate</text>
      </svg>
    );
  }

  const rad    = (angle - 90) * (Math.PI / 180);
  const x      = 50 + 40 * Math.cos(rad);
  const y      = 50 + 40 * Math.sin(rad);
  const large  = angle > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20">
      {/* Loss background (red full circle) */}
      <circle cx="50" cy="50" r="40" fill="#ef4444" />
      {/* Win arc (green) */}
      <path d={`M 50 50 L 50 10 A 40 40 0 ${large} 1 ${x} ${y} Z`} fill="#22c55e" />
      {/* Donut hole */}
      <circle cx="50" cy="50" r="26" fill="#1e293b" />
      <text x="50" y="47" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">{winPct}%</text>
      <text x="50" y="59" textAnchor="middle" fontSize="7" fill="#94a3b8">Win Rate</text>
    </svg>
  );
}

// Left-sidebar card showing rank, LP, W/L and pie chart
function RankCard({ entry, label }) {
  if (!entry) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{label}</p>
        <p className="text-slate-400 text-sm">Unranked</p>
      </div>
    );
  }

  const { tier, rank, leaguePoints, wins, losses } = entry;
  const total    = wins + losses;
  const hasRank  = !["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
  const color    = tierColors[tier] ?? "text-white";
  const emblem   = tierEmblems[tier] ?? null;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">{label}</p>

      {/* Emblem + rank */}
      <div className="flex flex-col items-center gap-1">
        {emblem && (
          <div style={{ width: "100%", height: "140px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={emblem.src}
              alt={tier}
              style={{ width: "100%", height: "auto", transform: "scale(3)", transformOrigin: "center center" }}
            />
          </div>
        )}
        <p className={`text-lg font-bold ${color}`}>
          {capitalizeTier(tier)}{hasRank ? ` ${rank}` : ""}
        </p>
        <p className="text-slate-400 text-sm">{leaguePoints} LP</p>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-slate-700/50" />

      {/* Pie chart + stats */}
      <div className="flex flex-col items-center gap-3">
        <WinRatePie wins={wins} losses={losses} />
        <div className="text-center text-sm">
          <p className="text-slate-300 font-medium">{total} Games</p>
          <p className="text-xs mt-1">
            <span className="text-green-400">{wins}W</span>
            <span className="text-slate-500"> / </span>
            <span className="text-red-400">{losses}L</span>
          </p>
        </div>
      </div>
    </div>
  );
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
  const [matches, rankedEntries] = await Promise.all([
    getMatchHistory(data.puuid, cluster),
    getRankedStats(data.puuid, region),
  ]);

  const soloQ = rankedEntries.find(e => e.queueType === "RANKED_SOLO_5x5") ?? null;
  const flexQ = rankedEntries.find(e => e.queueType === "RANKED_FLEX_SR")  ?? null;
  console.log("[Page] soloQ:", soloQ, "| flexQ:", flexQ);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start bg-slate-950 py-16 text-white">

      {/* Background glow blobs — isolated so overflow-hidden doesn't break sticky */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-700/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4">

        {/* Profile card — full width */}
        <div className="overflow-hidden rounded-2xl border border-slate-700/50">

          {/* Splash art + profile overlay */}
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

            {/* Dark gradient for readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/20 to-black/70" />

            {/* Profile content — centered over the splash art */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {data.iconUrl && (
                <Image
                  src={data.iconUrl}
                  alt="Profile Icon"
                  width={110}
                  height={110}
                  className="rounded-full border-4 border-blue-500 ring-4 ring-black/40 drop-shadow-2xl"
                />
              )}
              <div className="text-center drop-shadow-lg">
                <h1 className="text-3xl font-bold">
                  {data.gameName}
                  <span className="text-slate-300">#{data.tagLine}</span>
                </h1>
                <p className="mt-1 text-slate-300">Level {data.level}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Two-column layout: sticky rank sidebar + match history */}
        <div className="mt-6 flex gap-6 items-start">

          {/* Sticky left sidebar — bleibt beim Scrollen sichtbar */}
          <div className="sticky top-6 w-56 shrink-0 flex flex-col gap-4">
            <RankCard entry={soloQ} label="Ranked Solo / Duo" />
            <RankCard entry={flexQ} label="Ranked Flex" />
          </div>

          {/* Match history — füllt den restlichen Platz */}
          <div className="flex-1 min-w-0">
            <h2 className="mb-4 text-lg font-semibold text-slate-300">Recent Matches</h2>

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

        <Link href="/" className="mt-6 inline-block text-sm text-blue-400 hover:underline">
          ← Back to Search
        </Link>

          </div>{/* right column */}
        </div>{/* flex row */}

      </div>{/* max-w-5xl */}
    </main>
  );
}
