"use client";
import { useState } from "react";
import MoodBackground from "./MoodBackground";
import { MOODS, GENRES, MoodKey, GenreKey } from "./lib/theme";

type PlaylistItem = {
  id: string;
  name: string;
  description?: string;
  external_url?: string;
  images?: { url: string; width?: number | null; height?: number | null }[];
  owner?: string;

  sample_tracks?: Array<{
    id: string;
    name: string;
    artists: string;
    external_url?: string;
    preview_url?: string | null;
    album?: { id?: string; name?: string; images?: { url: string }[] };
  }>;
};

export default function MoodGenrePicker() {
  const [mood, setMood] = useState<MoodKey>("calm");
  const [genre, setGenre] = useState<GenreKey>("lofi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PlaylistItem[]>([]);

  async function fetchPlaylists() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        mood,
        genre,
        country: "US",
        limit: "12",
        minTracks: "0",
        tracks: "true",
      });

      const res = await fetch(`/api/playlist?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setItems(json.items as PlaylistItem[]);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen text-white">
      <MoodBackground mood={mood} />

      <header className="mx-auto max-w-5xl px-6 pt-10">
        <h1 className="text-3xl font-bold tracking-tight">Synesthetic</h1>
        <p className="opacity-85">Pick a mood and a genre—your world will follow :D</p>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 grid gap-8">
        {/* Mood selector */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Mood</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MOODS).map(([key, m]) => (
              <button
                key={key}
                onClick={() => setMood(key as MoodKey)}
                className={`rounded-2xl px-4 py-2 backdrop-blur
                  border border-white/15 hover:border-white/40 transition
                  ${mood === key ? "bg-white/20" : "bg-white/10"}`}
                style={{ color: "white" }}
                aria-pressed={mood === key}
              >
                {m.label}
              </button>
            ))}
          </div>
        </section>

        {/* Genre selector */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Genre</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GENRES).map(([key, g]) => (
              <button
                key={key}
                onClick={() => setGenre(key as GenreKey)}
                className={`rounded-2xl px-4 py-2 bg-black/30
                  border border-white/10 hover:border-white/40 transition
                  ${genre === key ? "outline outline-2 outline-[var(--accent)]" : ""}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </section>

        {/* Action */}
        <section className="flex items-center gap-3">
          <button
            onClick={fetchPlaylists}
            className="rounded-2xl border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? "Loading" : "Search playlists"}
          </button>
          <div className="opacity-80 text-sm">
            Mood: <span className="font-semibold">{MOODS[mood].label}</span> ·
            Genre: <span className="font-semibold">{GENRES[genre].label}</span>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-900/30 p-3 text-rose-100">
            {error}
          </div>
        )}

        {/* Results */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="aspect-square w-full rounded-xl bg-white/10" />
                <div className="mt-3 h-5 w-2/3 rounded bg-white/10" />
                <div className="mt-2 h-4 w-1/2 rounded bg-white/10" />
              </div>
            ))}

          {!loading &&
            items.map((p) => <PlaylistCard key={p.id} item={p} />)}
        </section>

        {!loading && !error && items.length === 0 && (
          <div className="mt-4 opacity-80">Nothing here. Click “Search playlists”.</div>
        )}
      </main>
    </div>
  );
}

function PlaylistCard({ item }: { item: PlaylistItem }) {
  const cover = item.images?.[0]?.url;

  return (
    <div className="group rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-white/30">
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-white/10">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/50">
              No image
            </div>
          )}
        </div>
        {item.external_url && (
          <a
            href={item.external_url}
            target="_blank"
            rel="noreferrer"
            className="absolute right-3 top-3 rounded-full border border-emerald-400/40 bg-emerald-500/80 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-emerald-500"
          >
            Open in Spotify
          </a>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-tight">{item.name}</h3>
      {item.owner && (
        <div className="mt-1 text-xs text-white/70">by {item.owner}</div>
      )}

      {item.sample_tracks && item.sample_tracks.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-cyan-200 hover:underline">
            See tracks
          </summary>
          <ul className="mt-2 space-y-2">
            {item.sample_tracks.slice(0, 10).map((t, i) => (
              <li
                key={`${item.id}-${t.id || i}`} // ✅ FIXED: unique key per playlist + index fallback
                className="rounded-xl border border-white/10 bg-black/40 p-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-white/70">{t.artists}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.preview_url && <audio controls src={t.preview_url} className="h-8" />}
                    {t.external_url && (
                      <a
                        href={t.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-300 hover:underline"
                      >
                        Open
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}