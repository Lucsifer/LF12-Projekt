export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white gap-4">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
      <p className="text-slate-400">Looking up summoner...</p>
    </main>
  );
}
