import Image from "next/image";
import Link from "next/link";

const regionToCluster = {
  euw1: "europe",
  eun1: "europe",
  na1:  "americas",
  br1:  "americas",
  kr:   "asia",
  jp1:  "asia",
};

async function getSummoner(gameName, tagLine, region) {
  const cluster = regionToCluster[region] ?? "europe";
  const apiKey  = process.env.RIOT_API_KEY;

  // 1. Account via Riot ID holen → gibt puuid zurück
  const accountRes = await fetch(
    `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { headers: { "X-Riot-Token": apiKey }, cache: "no-store" }
  );
  if (!accountRes.ok) return null;
  const account = await accountRes.json();

  // 2. Summoner via PUUID holen → gibt Level und Icon-ID zurück
  const summonerRes = await fetch(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
    { headers: { "X-Riot-Token": apiKey }, cache: "no-store" }
  );
  if (!summonerRes.ok) return { ...account, level: "?", iconUrl: null };
  const summoner = await summonerRes.json();

  // 3. Neueste Data Dragon Version für die Icon-URL holen
  const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versions    = await versionsRes.json();
  const version     = versions[0];

  return {
    gameName: account.gameName,
    tagLine:  account.tagLine,
    level:    summoner.summonerLevel,
    iconUrl:  `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`,
  };
}

export default async function SummonerPage({ params }) {
  const { region, name, tag } = await params;
  const gameName = decodeURIComponent(name);
  const tagLine  = decodeURIComponent(tag);

  const data = await getSummoner(gameName, tagLine, region);

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white gap-4">
        <p className="text-red-400 text-xl">Spieler nicht gefunden</p>
        <Link href="/" className="text-blue-400 hover:underline">← Zurück</Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white gap-6">
      {data.iconUrl && (
        <Image
          src={data.iconUrl}
          alt="Profile Icon"
          width={120}
          height={120}
          className="rounded-full border-4 border-blue-500"
        />
      )}

      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {data.gameName}
          <span className="text-gray-400">#{data.tagLine}</span>
        </h1>
        <p className="text-gray-400 mt-2">Level {data.level}</p>
      </div>

      <Link href="/" className="text-blue-400 hover:underline text-sm">
        ← Zurück zur Suche
      </Link>
    </main>
  );
}
