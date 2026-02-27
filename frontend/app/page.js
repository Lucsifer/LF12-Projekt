"use client";

import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [Testset1, setTestset] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="mb-8 text-4xl font-bold">Sucheleiste</h1>

      <div className="flex gap-3">
        {/* Dropdown */}
        <select
          value={Testset1}
          onChange={(e) => setTestset(e.target.value)}
          className="rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Teste mich">Text1</option>
          <option value="Teste mich nicht">Text2</option>
          <option value="Nein">Text3</option>
          <option value="Herr Ecken">Text4</option>
        </select>

        {/* Suchfeld */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche Hier nach Etwas "
          className="w-80 rounded-lg bg-gray-700 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Button */}
        <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">
          Suche
        </button>
      </div>

      {/* Ausgabe zum Verstehen */}
      {search && (
        <p className="mt-6 text-gray-400">
          Suche nach: <span className="text-white font-semibold">{search}</span> {" "}
          <span className="text-white font-semibold">{Testset1.toUpperCase()}</span>
        </p>
      )}
    </main>
  );
}
