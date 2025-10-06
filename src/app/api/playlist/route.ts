import { NextResponse } from "next/server";
export const runtime = "nodejs";

/** --- defaults/config --- */
const DEFAULT_MARKET = "US";
const DEFAULT_LIMIT = 20;
const MAX_PLAYLISTS = 30; // busca um pouco mais e filtra/ordena depois

// cache simples de token (memória do processo)
let CACHED_TOKEN: { value: string; expiresAt: number } | null = null;

const MOOD_MAP: Record<string, { keywords: string[]; categoryId?: string }> = {
  calm:       { keywords: ["calm", "chill", "acoustic", "relax"], categoryId: "chill" },
  happy:      { keywords: ["happy", "feel good", "good vibes"],    categoryId: "mood" },
  sad:        { keywords: ["sad", "melancholy", "rainy day"],      categoryId: "mood" },
  energetic:  { keywords: ["workout", "power", "hype", "energy"],  categoryId: "workout" },
  focused:    { keywords: ["focus", "deep focus", "lofi", "study"],categoryId: "focus" },
  romantic:   { keywords: ["romantic", "love", "date night"],      categoryId: "mood" },
};

async function getToken(): Promise<string> {
  const now = Date.now();
  if (CACHED_TOKEN && CACHED_TOKEN.expiresAt > now + 5000) {
    return CACHED_TOKEN.value;
  }
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!client_id || !client_secret) throw new Error("Missing Spotify credentials");

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Spotify token error: ${res.status} → ${text}`);
  const data = JSON.parse(text);
  // guarda por ~55min (expires_in é 3600s)
  CACHED_TOKEN = { value: data.access_token, expiresAt: now + 55 * 60 * 1000 };
  return data.access_token as string;
}

function buildPlaylistQuery(mood?: string | null, genre?: string | null) {
  const moodKey = (mood ?? "").toLowerCase();
  const genreKey = (genre ?? "").toLowerCase();

  const moodBits = MOOD_MAP[moodKey]?.keywords ?? [];
  const parts: string[] = [];
  if (genreKey) parts.push(genreKey);
  if (moodBits.length) parts.push(...moodBits);
  parts.push("playlist", "mix");

  const q = Array.from(new Set(parts.filter(Boolean))).join(" ");
  return q || "mood mix";
}

function normalizePlaylists(items: any[]) {
  return (items ?? [])
    .filter((p: any) => p && typeof p === "object" && typeof p.id === "string")
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      external_url: p.external_urls?.spotify,
      images: p.images,
      owner: p.owner?.display_name,
      tracks_count: p.tracks?.total ?? 0,
    }));
}

async function searchPlaylists(token: string, q: string, market: string) {
  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", q);
  url.searchParams.set("type", "playlist");
  url.searchParams.set("limit", String(MAX_PLAYLISTS));
  url.searchParams.set("market", market);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const text = await res.text();
  if (!res.ok) throw new Error(`Spotify search error: ${res.status} → ${text}`);
  const data = JSON.parse(text);
  return normalizePlaylists(data?.playlists?.items ?? []);
}

async function categoryPlaylists(token: string, mood: string | null, market: string) {
  const moodKey = (mood ?? "").toLowerCase();
  const cat = MOOD_MAP[moodKey]?.categoryId;
  if (!cat) return [];
  const url = new URL(`https://api.spotify.com/v1/browse/categories/${cat}/playlists`);
  url.searchParams.set("country", market);
  url.searchParams.set("limit", String(MAX_PLAYLISTS));

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) return [];
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return normalizePlaylists(data?.playlists?.items ?? []);
  } catch {
    return [];
  }
}

async function fetchPlaylistTracksSample(token: string, playlistId: string, market: string, limit = 20) {
  const url = new URL(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`);
  url.searchParams.set("market", market);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? [])
    .map((i: any) => i?.track)
    .filter((t: any) => t?.id)
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      artists: (t.artists ?? []).map((a: any) => a.name).join(", "),
      external_url: t.external_urls?.spotify,
      preview_url: t.preview_url,
      album: { id: t.album?.id, name: t.album?.name, images: t.album?.images },
    }));
}

function dedupeById<T extends { id: string }>(arr: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mood = searchParams.get("mood");
    const genre = searchParams.get("genre");
    const market = (searchParams.get("country") ?? DEFAULT_MARKET).toUpperCase();
    const limit = Math.max(1, Math.min(Number(searchParams.get("limit") ?? DEFAULT_LIMIT), 50));
    const minTracks = Math.max(0, Number(searchParams.get("minTracks") ?? 0));
    const includeTracks = searchParams.get("tracks") === "true";

    const token = await getToken();

    const q = buildPlaylistQuery(mood, genre);
    let playlists = await searchPlaylists(token, q, market);

    if (!playlists.length) {
      const byCat = await categoryPlaylists(token, mood, market);
      playlists = playlists.concat(byCat);
    }

    // filtra, ordena e deduplica
    playlists = playlists
      .filter(p => p.tracks_count >= minTracks)
      .sort((a, b) => (b.tracks_count ?? 0) - (a.tracks_count ?? 0));

    playlists = dedupeById(playlists).slice(0, limit);

    if (includeTracks) {
      const sampled = await Promise.all(
        playlists.map(async (p) => ({
          ...p,
          sample_tracks: await fetchPlaylistTracksSample(token, p.id, market, 15),
        }))
      );
      return NextResponse.json({ ok: true, query: { mood, genre, q, market, limit, minTracks, tracks: true }, count: sampled.length, items: sampled });
    }

    return NextResponse.json({ ok: true, query: { mood, genre, q, market, limit, minTracks }, count: playlists.length, items: playlists });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}