// app/page.tsx
import type { Metadata } from "next";
import MoodGenrePicker from "./components/MoodGenrePicker";

export const metadata: Metadata = {
  title: "Synesthetic",
  description: "Pick a mood + genre and watch the world change.",
};

export default function Home() {
  return (
    <main className="relative min-h-dvh text-white">
      <MoodGenrePicker />
    </main>
  );
}