
export type MoodKey =
  | "calm" | "happy" | "sad" | "energetic" | "focused" | "romantic";

export type GenreKey =
  | "afrobeats" | "rnb" | "reggae" | "funk" | "pop"
  | "hiphop" | "edm" | "indie" | "rock" | "classical" | "latin" | "lofi";

export const MOODS: Record<MoodKey, {
  label: string;
  // Use CSS variables so you can theme the whole UI (buttons, chips, etc.)
  vars: { "--bg1": string; "--bg2": string; "--accent": string };
  video: string;   // url for the mood background loop (short, <10–15s, seamless)
  filter?: string; // optional CSS filter for tinting if your video is neutral
}> = {
  calm:      { label: "Calm",      vars: {"--bg1":"#92C5FF","--bg2":"#D9F1FF","--accent":"#3B82F6"}, video: "/vid/calm.mp4",      filter:"hue-rotate(190deg) saturate(0.9)" },
  happy:     { label: "Happy",     vars: {"--bg1":"#FFE08A","--bg2":"#FFD1DC","--accent":"#F59E0B"}, video: "/vid/happy.mp4" },
  sad:       { label: "Sad",       vars: {"--bg1":"#1F2A44","--bg2":"#3B3E66","--accent":"#64748B"}, video: "/vid/sad.mp4" },
  energetic: { label: "Energetic", vars: {"--bg1":"#FF5A5F","--bg2":"#FF9F1C","--accent":"#EF4444"}, video: "/vid/energetic.mp4" },
  focused:   { label: "Focused",   vars: {"--bg1":"#0F172A","--bg2":"#1E293B","--accent":"#10B981"}, video: "/vid/focused.mp4" },
  romantic:  { label: "Romantic",  vars: {"--bg1":"#FFB3C1","--bg2":"#A78BFA","--accent":"#EC4899"}, video: "/vid/romantic.mp4" },
};

export const GENRES: Record<GenreKey, { label: string; icon?: string }> = {
  afrobeats:{ label:"Afrobeats" }, rnb:{ label:"R&B" }, reggae:{ label:"Reggae" },
  funk:{ label:"Funk" }, pop:{ label:"Pop" }, hiphop:{ label:"Hip-Hop" },
  edm:{ label:"Electronic" }, indie:{ label:"Indie/Alt" }, rock:{ label:"Rock" },
  classical:{ label:"Classical" }, latin:{ label:"Latin/Reggaeton" }, lofi:{ label:"Lo-Fi/Chill" },
};