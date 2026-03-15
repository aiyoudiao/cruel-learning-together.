# GitHub Study Tracker V3 - Web3 Edition

A Cyberpunk/Solana-inspired study tracker built with React, Vite, TailwindCSS, and GitHub as a backend.

## 🌟 Version 3 Features

- **Web3 Cyberpunk UI**: Minimalist, neon-glowing design inspired by Solana.
- **Theme System**: Toggle between Solana, Cyberpunk, Dark, and Light themes.
- **Multi-Category**: Track learning in AI, Frontend, English, Math, and Reading.
- **Rich Text Editor**: TipTap integration with Markdown support and media uploads.
- **AI-Ready Architecture**: Structured for future AI-generated reports.

## 🏗 System Architecture

```mermaid
graph TD
    User[User] -->|Check-in| App[Web App (React/Vite)]
    App -->|Upload Assets| GitHubAssets[GitHub Assets]
    App -->|Save Data| GitHubJSON[GitHub JSON Store]
    GitHubJSON -->|Trigger| Action[GitHub Action]
    Action -->|Run| SyncScript[Python Sync Script]
    SyncScript -->|Update| README[Leaderboard]
    SyncScript -->|Update| UserLogs[User Markdown Logs]
    SyncScript -->|Generate| Reports[Future AI Reports]
```

## 🎨 Theme System

The system uses Tailwind CSS and CSS variables for theming.
Themes are defined in `src/context/ThemeContext.tsx` and applied via `data-theme` attribute.

- **Solana**: `#9945FF` (Purple) & `#14F195` (Green)
- **Cyberpunk**: `#00F0FF` (Cyan) & `#FF003C` (Pink) & `#FTEE0E` (Yellow)

## 📚 Category System

Data is stored hierarchically:
`checkins/{category}/{date}.json`

Supported categories:
- AI
- Frontend
- English
- Math
- Reading

## 🤖 Future AI Features

The `reports/` directory is prepared for:
- **Weekly Summaries**: AI analysis of weekly progress.
- **Knowledge Graphs**: Connecting concepts learned across categories.
- **Streak Predictions**: AI-driven motivation.

## 🚀 Getting Started

1.  Clone repository.
2.  `cd web`
3.  `npm install`
4.  `npm run dev`

## 🛠 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, TipTap
- **Backend**: GitHub API, GitHub Actions
- **Scripting**: Python
