# 🎧 Synesthetic

<img width="1511" height="851" alt="Screenshot 2025-10-06 at 1 14 16 AM" src="https://github.com/user-attachments/assets/9323d877-2da6-4ebc-b1a0-65e776be1625" />

**Synesthetic** is a mood-driven music discovery app that merges **emotion, color, and sound**.  
Pick how you feel — and your favorite genre — and the interface transforms in real-time while curated Spotify playlists appear to match your vibe.

🌐 **Live Demo:** [synesthetic.vercel.app](https://synesthetic.vercel.app)
---

## 🪄 Overview

Synesthetic bridges art and data through an interactive experience that visualizes sound.  
It uses the **Spotify Web API** to fetch playlists that align with a user’s selected *mood* and *genre*, dynamically adapting the UI colors and background animations to reflect that energy.  
Every playlist expands to preview tracks — blending emotional design with practical data querying.

This project was designed, coded, and deployed by **Letícia Scudeller**, a BUCS (Business + Computer Science) student at UBC passionate about creative tech and AI-powered interfaces.
---

## 🚀 Features

| Feature | Description |
|----------|-------------|
| 🎨 **Mood & Genre Picker** | Choose a mood and a music genre; the interface color palette shifts instantly. |
| 🎧 **Spotify Integration** | Fetches matching playlists using Spotify’s `/search` and `/categories` endpoints. |
| ⚡ **Serverless API** | Cached Spotify tokens via Vercel’s Edge Runtime for fast performance. |
| 🌈 **Dynamic Backgrounds** | Seamless looping videos and gradients visualize each mood. |
| 💽 **Deployed on Vercel** | Continuous deployment and auto-builds from GitHub. |

---

## 🧰 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API:** Spotify Web API
- **Deployment:** Vercel Serverless Functions
- **Runtime:** Node.js 20

---
## 🧠 Technical Highlights

- Token caching in memory to minimize Spotify API calls  
- Deduplication and sorting of playlist results by track count  
- Graceful handling of Spotify API errors  
- Progressive loading skeletons for improved UX  
- Fully typed React components (`MoodKey`, `GenreKey` enums)  
- Modular architecture (frontend + serverless backend in one codebase)

---
👩🏻‍💻 About the Developer
Letícia Scudeller Carvalho
🌐 LinkedIn: https://www.linkedin.com/in/leticiascudeller/
