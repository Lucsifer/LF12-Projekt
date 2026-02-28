"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("euw1");
  const [fehler, setFehler] = useState(null);
  const router = useRouter();

  function handleSearch() {
    if (!search) return;

    const [gameName, tagLine] = search.split("#");
    if (!gameName || !tagLine) {
      setFehler("Format: Name#Tag (z.B. Faker#T1)");
      return;
    }

    setFehler(null);
    router.push(`/summoner/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="mb-8 text-4xl font-bold">Summoner Search</h1>

      <div className="flex gap-3">
        {/* Region Dropdown */}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="euw1">EUW</option>
          <option value="eun1">EUNE</option>
          <option value="na1">NA</option>
          <option value="kr">KR</option>
          <option value="br1">BR</option>
          <option value="jp1">JP</option>
        </select>

        {/* Suchfeld */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name#Tag (z.B. Faker#T1)"
          className="w-80 rounded-lg bg-gray-700 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Button */}
        <button
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {fehler && <p className="mt-6 text-red-400">{fehler}</p>}
    </main>
  );
}
