import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(s?: string | null) {
  return (s ?? "").replace(/^\s+|\s+$/g, "").replace(/^[\'\"]|[\'\"]$/g, "").replace(/\r?\n/g, "");
}

export async function GET() {
  const idRaw = process.env.SPOTIFY_CLIENT_ID ?? "";
  const secRaw = process.env.SPOTIFY_CLIENT_SECRET ?? "";
  const id = clean(idRaw);
  const sec = clean(secRaw);

  let tokenOk = false, tokenError: string | null = null;
  try {
    if (!id || !sec) throw new Error(`missing-envs idLen=${id.length} secretLen=${sec.length}`);
    const basic = Buffer.from(`${id}:${sec}`, "utf8").toString("base64");
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
      cache: "no-store",
    });
    const txt = await r.text();
    if (r.ok) tokenOk = true; else tokenError = `${r.status} ${txt}`;
  } catch (e: any) { tokenError = String(e?.message ?? e); }

  return NextResponse.json({
    env: process.env.VERCEL_ENV ?? "unknown",
    projectUrl: process.env.VERCEL_URL ?? null,
    idLen: id.length,
    secretLen: sec.length,
    idPrefix: id.slice(0,6),
    tokenOk,
    tokenError,
  });
}