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

    // 3. Get latest Data Dragon version for the icon URL
    // No cache: "no-store" here — version only changes on patch days (~2 weeks)
    const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions    = await versionsRes.json();
    const version     = versions[0];

    return {
      gameName:   account.gameName,
      tagLine:    account.tagLine,
      puuid:      account.puuid,
      summonerId: summoner.id,
      level:      summoner.summonerLevel,
      iconUrl:    `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`,
    };
  } catch {
    // Network error, timeout, or unexpected failure
    return null;
  }
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

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 text-white">

      {/* Background glow blobs — matches home page */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-700/10 blur-3xl" />

      {/* Profile card */}
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-800/50 p-10 backdrop-blur-sm text-center">

        {data.iconUrl && (
          <Image
            src={data.iconUrl}
            alt="Profile Icon"
            width={120}
            height={120}
            className="mx-auto rounded-full border-4 border-blue-500"
          />
        )}

        <h1 className="mt-5 text-3xl font-bold">
          {data.gameName}
          <span className="text-slate-400">#{data.tagLine}</span>
        </h1>

        <p className="mt-2 text-slate-400">Level {data.level}</p>

      </div>

      <Link href="/" className="mt-6 text-sm text-blue-400 hover:underline">
        ← Back to Search
      </Link>

    </main>
  );
}
