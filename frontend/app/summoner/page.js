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

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

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

function PlayerRow({ player, version, isSelf }) {
  const name = player.riotIdGameName || player.summonerName || "Unknown";
  const kda  = `${player.kills}/${player.deaths}/${player.assists}`;

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
      <span className={`truncate text-sm w-28 ${isSelf ? "font-semibold text-white" : "text-slate-300"}`}>
        {name}
      </span>
      <span className="text-xs text-slate-400 font-mono ml-auto">{kda}</span>
    </div>
  );
}

function SummonerContent() {
  const searchParams = useSearchParams();
  const region = searchParams.get("region");
  const name   = searchParams.get("name");
  const tag    = searchParams.get("tag");

  const [summoner, setSummoner] = useState(null);
  const [ranked,   setRanked]   = useState([]);
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

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

      <div className="relative z-10 w-full max-w-5xl px-4">

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

                const won      = player.win;
                const team1    = participants.filter((p) => p.teamId === 100);
                const team2    = participants.filter((p) => p.teamId === 200);
                const team1Won = team1[0]?.win ?? false;

                return (
                  <div
                    key={match.metadata.matchId}
                    className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
                      won ? "border-green-700/50" : "border-red-700/50"
                    }`}
                  >
                    <div className={`flex items-center justify-between px-5 py-3 ${
                      won ? "bg-green-900/30" : "bg-red-900/30"
                    }`}>
                      <div className="flex items-center gap-4">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/${summoner.ddragonVersion}/img/champion/${player.championName}.png`}
                          alt={player.championName}
                          width={40}
                          height={40}
                          className="rounded-lg"
                          unoptimized
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

                    <div className="grid grid-cols-2 gap-px bg-slate-700/30 px-4 py-3">
                      <div className="pr-3">
                        <p className={`text-xs font-semibold mb-2 ${team1Won ? "text-green-400" : "text-red-400"}`}>
                          {team1Won ? "Victory" : "Defeat"}
                        </p>
                        <div className="flex flex-col gap-1">
                          {team1.map((p) => (
                            <PlayerRow key={p.puuid} player={p} version={summoner.ddragonVersion} isSelf={p.puuid === summoner.puuid} />
                          ))}
                        </div>
                      </div>

                      <div className="pl-3 border-l border-slate-700/50">
                        <p className={`text-xs font-semibold mb-2 ${!team1Won ? "text-green-400" : "text-red-400"}`}>
                          {!team1Won ? "Victory" : "Defeat"}
                        </p>
                        <div className="flex flex-col gap-1">
                          {team2.map((p) => (
                            <PlayerRow key={p.puuid} player={p} version={summoner.ddragonVersion} isSelf={p.puuid === summoner.puuid} />
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
