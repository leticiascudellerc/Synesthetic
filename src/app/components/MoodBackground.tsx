"use client";
import { useEffect, useRef } from "react";
import { MOODS, MoodKey } from "./lib/theme";

export default function MoodBackground({ mood }: { mood: MoodKey }) {
  const v = useRef<HTMLVideoElement>(null);
  const { video, vars, filter } = MOODS[mood];

  useEffect(() => {
    if (v.current) { v.current.currentTime = 0; v.current.play().catch(()=>{}); }
  }, [mood]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={vars as React.CSSProperties}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--bg1),var(--bg2))]" />
      <video
        key={mood}                       // smooth remount on change
        ref={v}
        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-500"
        src={video}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{ filter }}
      />
      <div className="absolute inset-0 bg-black/25 mix-blend-multiply" />
    </div>
  );
}