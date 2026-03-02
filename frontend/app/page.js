"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("euw1");
  const [error, setError] = useState(null);
  const router = useRouter();

  function handleSearch() {
    if (!search) return;

    const [gameName, tagLine] = search.split("#");
    if (!gameName || !tagLine) {
      setError("Format: Name#Tag (e.g. Faker#T1)");
      return;
    }

    setError(null);
    router.push(`/summoner/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
  }

  // Allow pressing Enter to search
  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 text-white">

      {/* Background glow blobs */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-700/10 blur-3xl" />

      {/* Hero text */}
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400">
          League of Legends
        </p>
        <h1 className="bg-linear-to-b from-white to-slate-400 bg-clip-text text-6xl font-bold text-transparent">
          Summoner Search
        </h1>
        <p className="mt-4 text-slate-400">
          Look up any player's profile across all regions
        </p>
      </div>

      {/* Search card */}
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-5">

          {/* Region dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-400">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-700/80 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="euw1">EUW — Europe West</option>
              <option value="eun1">EUNE — Europe Nordic & East</option>
              <option value="na1">NA — North America</option>
              <option value="kr">KR — Korea</option>
              <option value="br1">BR — Brazil</option>
              <option value="jp1">JP — Japan</option>
            </select>
          </div>

          {/* Search input + button */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-400">Summoner Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Name#Tag (e.g. Faker#T1)"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-700/80 px-4 py-3 placeholder-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition-colors hover:bg-blue-500"
              >
                Search
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

        </div>
      </div>
    </main>
  );
}
