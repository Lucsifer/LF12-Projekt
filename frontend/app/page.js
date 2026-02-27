"use client";

import { useState } from "react";

export default function Home() {
  const [search, setSearch]   = useState("");
  const [region, setRegion]   = useState("euw1");
  const [ergebnis, setErgebnis] = useState(null);
  const [fehler, setFehler]   = useState(null);
  const [laden, setLaden]     = useState(false);

  async function handleSearch() {
    if (!search) return;

    // Eingabe aufteilen: "Name#Tag" → ["Name", "Tag"]
    const [gameName, tagLine] = search.split("#");
    if (!gameName || !tagLine) {
      setFehler("Format: Name#Tag");
      return;
    }

    setLaden(true);
    setFehler(null);
    setErgebnis(null);

    const res = await fetch(
      `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
    );
    const data = await res.json();

    setLaden(false);

    if (!res.ok) {
      setFehler(data.error ?? "Unknown Error");
    } else {
      setErgebnis(data);
    }
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
          placeholder="yourName#EUW"
          className="w-80 rounded-lg bg-gray-700 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Button */}
        <button
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={laden}
        >
          {laden ? "Searching..." : "Searching"}
        </button>
      </div>

      {/* Fehlermeldung */}
      {fehler && (
        <p className="mt-6 text-red-400">{fehler}</p>
      )}

      {/* Ergebnis */}
      {ergebnis && (
        <div className="mt-8 rounded-lg bg-gray-700 p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Riot ID</p>
          <p className="text-2xl font-bold">
            {ergebnis.gameName}
            <span className="text-gray-400">#{ergebnis.tagLine}</span>
          </p>
          <p className="text-gray-500 text-xs mt-3">PUUID: {ergebnis.puuid}</p>
        </div>
      )}
    </main>
  );
}
