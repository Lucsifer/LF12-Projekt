"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import emblemIron        from "@/app/assets/ranked-emblem/emblem-iron.png";
import emblemBronze      from "@/app/assets/ranked-emblem/emblem-bronze.png";
import emblemSilver      from "@/app/assets/ranked-emblem/emblem-silver.png";
import emblemGold        from "@/app/assets/ranked-emblem/emblem-gold.png";
import emblemPlatinum    from "@/app/assets/ranked-emblem/emblem-platinum.png";
import emblemDiamond     from "@/app/assets/ranked-emblem/emblem-diamond.png";
import emblemMaster      from "@/app/assets/ranked-emblem/emblem-master.png";
import emblemGrandmaster from "@/app/assets/ranked-emblem/emblem-grandmaster.png";
import emblemChallenger  from "@/app/assets/ranked-emblem/emblem-challenger.png";

const API = process.env.NEXT_PUBLIC_API_URL || "";
 
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
  return modes[mode] ?? mode;
}

function WinRatePie({ wins, losses }) {
  const total = wins + losses;
  if (total === 0) return null;

  const winPct = Math.round((wins / total) * 100);
  const angle  = (wins / total) * 360;

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

  const rad   = (angle - 90) * (Math.PI / 180);
  const x     = 50 + 40 * Math.cos(rad);
  const y     = 50 + 40 * Math.sin(rad);
  const large = angle > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20">
      <circle cx="50" cy="50" r="40" fill="#ef4444" />
      <path d={`M 50 50 L 50 10 A 40 40 0 ${large} 1 ${x} ${y} Z`} fill="#22c55e" />
      <circle cx="50" cy="50" r="26" fill="#1e293b" />
      <text x="50" y="47" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">{winPct}%</text>
      <text x="50" y="59" textAnchor="middle" fontSize="7" fill="#94a3b8">Win Rate</text>
    </svg>
  );
}

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
  const total   = wins + losses;
  const hasRank = !["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
  const color   = tierColors[tier] ?? "text-white";
  const emblem  = tierEmblems[tier] ?? null;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">{label}</p>

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

      <div className="my-4 border-t border-slate-700/50" />

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

function PlayerRow({ player, version, isSelf, region }) {
  const name    = player.riotIdGameName || player.summonerName || "Unknown";
  const tagline = player.riotIdTagline;
  const kda     = `${player.kills}/${player.deaths}/${player.assists}`;

  const profileHref =
    !isSelf && name !== "Unknown" && tagline
      ? `/summoner?region=${region}&name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tagline)}`
      : null;

  return (
    <div className={`flex items-center gap-2 rounded-lg px-2 py-1 ${isSelf ? "bg-blue-500/20 ring-1 ring-blue-500/50" : ""}`}>
      <Image
        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${player.championName}.png`}
        alt={player.championName}
        width={24}
        height={24}
        className="rounded-sm"
        unoptimized
      />
      {profileHref ? (
        <Link
          href={profileHref}
          className="truncate text-sm w-28 text-slate-300 hover:text-blue-400 hover:underline transition-colors"
        >
          {name}
        </Link>
      ) : (
        <span className={`truncate text-sm w-28 ${isSelf ? "font-semibold text-white" : "text-slate-300"}`}>
          {name}
        </span>
      )}
      <span className="text-xs text-slate-400 font-mono ml-auto">{kda}</span>
    </div>
  );
}

function SummonerContent() {
  const searchParams = useSearchParams();
  const region = searchParams.get("region");
  const name   = searchParams.get("name");
  const tag    = searchParams.get("tag");

  const [summoner,  setSummoner]  = useState(null);
  const [ranked,    setRanked]    = useState([]);
  const [matches,   setMatches]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [spellMap,   setSpellMap]   = useState({});
  const [runeMap,    setRuneMap]    = useState({});
  const [expanded,   setExpanded]   = useState(new Set());
  const [favorites,  setFavorites]  = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  const isFavorite = summoner && favorites.some((f) => f.puuid === summoner.puuid);

  async function loadFavorites() {
    const res = await fetch(`${API}/api/favorites`);
    if (res.ok) setFavorites(await res.json());
  }

  async function toggleFavorite() {
    if (!summoner) return;
    setFavLoading(true);
    if (isFavorite) {
      const fav = favorites.find((f) => f.puuid === summoner.puuid);
      await fetch(`${API}/api/favorites/${fav.id}`, { method: "DELETE" });
    } else {
      await fetch(`${API}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_name: summoner.gameName, tag_line: summoner.tagLine, region, puuid: summoner.puuid, icon_url: summoner.iconUrl }),
      });
    }
    await loadFavorites();
    setFavLoading(false);
  }

  useEffect(() => { loadFavorites(); }, []);

  useEffect(() => {
    if (!region || !name || !tag) return;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const summonerRes = await fetch(
          `${API}/api/summoner/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
        );
        if (!summonerRes.ok) { setError("Player not found"); setLoading(false); return; }
        const summonerData = await summonerRes.json();
        setSummoner(summonerData);

        const v = summonerData.ddragonVersion;
        const [spellRes, runesRes] = await Promise.all([
          fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/en_US/summoner.json`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/en_US/runesReforged.json`),
        ]);
        if (spellRes.ok) {
          const d = await spellRes.json();
          const m = {};
          Object.values(d.data).forEach(s => { m[parseInt(s.key)] = s.id; });
          setSpellMap(m);
        }
        if (runesRes.ok) {
          const d = await runesRes.json();
          const m = {};
          d.forEach(style => {
            m[style.id] = style.icon;
            style.slots.forEach(slot => slot.runes.forEach(r => { m[r.id] = r.icon; }));
          });
          setRuneMap(m);
        }

        const [rankedRes, matchesRes] = await Promise.all([
          fetch(`${API}/api/ranked/${region}/${summonerData.puuid}`),
          fetch(`${API}/api/matches/${region}/${summonerData.puuid}`),
        ]);

        if (rankedRes.ok)  setRanked(await rankedRes.json());
        if (matchesRes.ok) setMatches(await matchesRes.json());
      } catch (err) {
        console.error("Fetch error:", err);
        setError(`Backend nicht erreichbar (${API}) – läuft der Backend-Server?`);
      }

      setLoading(false);
    }

    load();
  }, [region, name, tag]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400 animate-pulse">Loading...</p>
      </main>
    );
  }

  if (error || !summoner) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <p className="text-red-400 text-xl">{error ?? "Player not found"}</p>
        <Link href="/" className="mt-4 text-blue-400 hover:underline">← Back to Search</Link>
      </main>
    );
  }

  const soloQ = ranked.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
  const flexQ = ranked.find((e) => e.queueType === "RANKED_FLEX_SR")  ?? null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start bg-slate-950 py-16 text-white">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-700/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4">

        {/* Profile card */}
        <div className="overflow-hidden rounded-2xl border border-slate-700/50">
          <div className="relative overflow-hidden bg-slate-900">
            {summoner.splashUrl && (
              <Image
                src={summoner.splashUrl}
                alt="Champion splash art"
                width={1215}
                height={717}
                style={{ width: "100%", height: "auto", display: "block" }}
                unoptimized
              />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/20 to-black/70" />
            {/* Favorite star button */}
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors disabled:opacity-50"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg className={`w-5 h-5 transition-colors ${isFavorite ? "text-yellow-400 fill-yellow-400" : "text-slate-400 fill-none"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {summoner.iconUrl && (
                <Image
                  src={summoner.iconUrl}
                  alt="Profile Icon"
                  width={110}
                  height={110}
                  className="rounded-full border-4 border-blue-500 ring-4 ring-black/40 drop-shadow-2xl"
                  unoptimized
                />
              )}
              <div className="text-center drop-shadow-lg">
                <h1 className="text-3xl font-bold">
                  {summoner.gameName}
                  <span className="text-slate-300">#{summoner.tagLine}</span>
                </h1>
                <p className="mt-1 text-slate-300">Level {summoner.level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rank sidebar + match history */}
        <div className="mt-6 flex gap-6 items-start">

          <div className="sticky top-6 w-56 shrink-0 flex flex-col gap-4">
            <RankCard entry={soloQ} label="Ranked Solo / Duo" />
            <RankCard entry={flexQ} label="Ranked Flex" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="mb-4 text-lg font-semibold text-slate-300">Recent Matches</h2>

            <div className="flex flex-col gap-4">
              {matches.length === 0 && (
                <p className="text-slate-500">No matches found.</p>
              )}

              {matches.map((match) => {
                const participants = match.info?.participants;
                if (!participants) return null;

                const player  = participants.find((p) => p.puuid === summoner.puuid);
                if (!player) return null;

                const won           = player.win;
                const team1         = participants.filter((p) => p.teamId === 100);
                const team2         = participants.filter((p) => p.teamId === 200);
                const team1Won      = team1[0]?.win ?? false;
                const cs            = (player.totalMinionsKilled ?? 0) + (player.neutralMinionsKilled ?? 0);
                const csPerMin      = (cs / (match.info.gameDuration / 60)).toFixed(1);
                const kda           = player.deaths === 0 ? "Perfect" : ((player.kills + player.assists) / player.deaths).toFixed(2);
                const keystoneId    = player.perks?.styles?.[0]?.selections?.[0]?.perk;
                const secStyleId    = player.perks?.styles?.[1]?.style;
                const ddragon       = `https://ddragon.leagueoflegends.com/cdn`;

                const isExpanded = expanded.has(match.metadata.matchId);
                const toggleExpanded = () => setExpanded(prev => {
                  const next = new Set(prev);
                  next.has(match.metadata.matchId) ? next.delete(match.metadata.matchId) : next.add(match.metadata.matchId);
                  return next;
                });

                return (
                  <div
                    key={match.metadata.matchId}
                    className={`rounded-2xl border overflow-hidden ${won ? "border-green-700/50" : "border-red-700/50"}`}
                  >
                    {/* Header row */}
                    <div className="flex items-stretch">

                      {/* WIN/LOSS box */}
                      <div className={`flex items-center justify-center w-14 shrink-0 ${won ? "bg-green-800/50" : "bg-red-800/50"}`}>
                        <span className={`text-xs font-bold tracking-wide [writing-mode:vertical-rl] rotate-180 ${won ? "text-green-300" : "text-red-300"}`}>
                          {won ? "WIN" : "LOSS"}
                        </span>
                      </div>

                      {/* Main content */}
                      <div className={`flex-1 flex items-center gap-3 px-4 py-3 ${won ? "bg-green-900/20" : "bg-red-900/20"}`}>

                        {/* Champion + level */}
                        <div className="relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`${ddragon}/${summoner.ddragonVersion}/img/champion/${player.championName}.png`} alt={player.championName} className="w-12 h-12 rounded-lg" />
                          <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-slate-900 text-white px-1 rounded leading-tight">{player.champLevel}</span>
                        </div>

                        {/* Summoner spells */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          {[player.summoner1Id, player.summoner2Id].map((sid, i) =>
                            spellMap[sid] ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img key={i} src={`${ddragon}/${summoner.ddragonVersion}/img/spell/${spellMap[sid]}.png`} alt="" className="w-[22px] h-[22px] rounded" />
                            ) : <div key={i} className="w-[22px] h-[22px] rounded bg-slate-700" />
                          )}
                        </div>

                        {/* Runes */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          {[keystoneId, secStyleId].map((id, i) =>
                            id && runeMap[id] ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img key={i} src={`${ddragon}/img/${runeMap[id]}`} alt="" className="w-[22px] h-[22px] rounded-full bg-slate-800 p-0.5" />
                            ) : <div key={i} className="w-[22px] h-[22px] rounded-full bg-slate-700" />
                          )}
                        </div>

                        {/* Stats + Items together */}
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400 mb-0.5">{formatGameMode(match.info.gameMode)} · {formatDuration(match.info.gameDuration)}</p>
                            <p className="font-mono font-bold text-lg leading-tight">
                              {player.kills}<span className="text-slate-500"> / </span><span className="text-red-400">{player.deaths}</span><span className="text-slate-500"> / </span>{player.assists}
                            </p>
                            <p className="text-sm text-slate-300">{kda} KDA</p>
                            <p className="text-xs text-slate-400">{cs} CS ({csPerMin}) · {player.visionScore ?? 0} Vision</p>
                          </div>

                          {/* Items: 3×2 + trinket */}
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <div className="grid grid-cols-3 gap-1">
                              {[0,1,2,3,4,5].map(i => {
                                const itemId = player[`item${i}`];
                                return itemId ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img key={i} src={`${ddragon}/${summoner.ddragonVersion}/img/item/${itemId}.png`} alt="" className="w-7 h-7 rounded" />
                                ) : <div key={i} className="w-7 h-7 rounded bg-slate-700/50" />;
                              })}
                            </div>
                            <div className="self-start">
                              {player.item6
                                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={`${ddragon}/${summoner.ddragonVersion}/img/item/${player.item6}.png`} alt="" className="w-7 h-7 rounded" />
                                : <div className="w-7 h-7 rounded bg-slate-700/50" />
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown button */}
                      <button
                        onClick={toggleExpanded}
                        className={`flex items-center justify-center w-10 shrink-0 border-l border-slate-700/40 transition-colors ${won ? "bg-green-900/20 hover:bg-green-800/30" : "bg-red-900/20 hover:bg-red-800/30"}`}
                      >
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Collapsible team scoreboard */}
                    {isExpanded && <div className="grid grid-cols-2 gap-px bg-slate-700/30 px-4 py-3">
                      <div className="pr-3">
                        <p className={`text-xs font-semibold mb-2 ${team1Won ? "text-green-400" : "text-red-400"}`}>
                          {team1Won ? "Victory" : "Defeat"}
                        </p>
                        <div className="flex flex-col gap-1">
                          {team1.map((p) => (
                            <PlayerRow key={p.puuid} player={p} version={summoner.ddragonVersion} isSelf={p.puuid === summoner.puuid} region={region} />
                          ))}
                        </div>
                      </div>

                      <div className="pl-3 border-l border-slate-700/50">
                        <p className={`text-xs font-semibold mb-2 ${!team1Won ? "text-green-400" : "text-red-400"}`}>
                          {!team1Won ? "Victory" : "Defeat"}
                        </p>
                        <div className="flex flex-col gap-1">
                          {team2.map((p) => (
                            <PlayerRow key={p.puuid} player={p} version={summoner.ddragonVersion} isSelf={p.puuid === summoner.puuid} region={region} />
                          ))}
                        </div>
                      </div>
                    </div>}
                  </div>
                );
              })}
            </div>

            <Link href="/" className="mt-6 inline-block text-sm text-blue-400 hover:underline">
              ← Back to Search
            </Link>
          </div>

          {/* Favorites sidebar */}
          <div className="sticky top-6 w-52 shrink-0 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-300">Favorites</h2>
            {favorites.length === 0 ? (
              <p className="text-sm text-slate-500">No favorites yet.</p>
            ) : (
              favorites.map((fav) => (
                <div key={fav.id} className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/60 px-3 py-2">
                  {fav.icon_url
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={fav.icon_url} alt="" className="w-7 h-7 rounded-full shrink-0" />
                    : <div className="w-7 h-7 rounded-full bg-slate-700 shrink-0" />
                  }
                  <Link
                    href={`/summoner?region=${fav.region}&name=${encodeURIComponent(fav.game_name)}&tag=${encodeURIComponent(fav.tag_line)}`}
                    className="flex-1 min-w-0 text-sm text-slate-200 hover:text-blue-400 hover:underline truncate"
                  >
                    {fav.game_name}
                  </Link>
                  <button
                    onClick={async () => { await fetch(`${API}/api/favorites/${fav.id}`, { method: "DELETE" }); loadFavorites(); }}
                    className="shrink-0 text-slate-600 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SummonerPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400 animate-pulse">Loading...</p>
      </main>
    }>
      <SummonerContent />
    </Suspense>
  );
}
