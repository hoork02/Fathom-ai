# Fathom AI — Intelligent Meeting Notetaker & Post-Call Synthesis

[![Live Demo](https://img.shields.io/badge/Live_Demo-fathom--ai.netlify.app-indigo?style=for-the-badge&logo=netlify)](https://fathom-ai.netlify.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-3.8_Flash-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)

An enterprise-grade post-meeting intelligence platform reproducing the core product experience of **[fathom.video](https://fathom.video)**. Fathom AI delivers synchronized diarized audio/video playback, interactive playhead scrubbing, dynamic AI summary templates with loading transition skeletons, contextual action item tracking with timestamp seeking, client-side transcript and action item export, and Cmd+K global search with visual keyword highlighting across multi-participant meetings.

---

## 🔗 Live Application

- **Production Live Demo:** [https://fathom-ai.netlify.app/](https://fathom-ai.netlify.app/)
- **Repository Runtime:** Full-stack Vite + React 19 + Express proxy with server-side Google Gemini 3.8 Flash integration.

---

## 💡 Product Judgment Note: Architectural Scope & Bot Simulation

> ### **Why is the live bot layer simulated instead of running headless Chromium bots?**
>
> In production meeting bot infrastructures (such as Recall.ai, Daily.co, or custom headless Puppeteer/Selenium pods), connecting a bot into live Zoom/Teams/Google Meet calls requires:
> 1. Provisioning continuous media-server container clusters with GPU/CPU audio decoding and virtual audio drivers.
> 2. Negotiating third-party OAuth app listings and tenant administrator approval gates (Zoom App Marketplace, Microsoft Azure AD App Registrations).
> 3. Handling WebRTC stream capture and cloud STT pipeline orchestration.
>
> **Product Rationale:**
> Rather than spending engineering bandwidth on cloud infrastructure orchestration and virtual audio drivers, **100% of product and engineering focus was deliberately channeled into post-meeting intelligence, transcript UX, and executive synthesis**:
>
> - **Rich Diarized Playback Engine**: Synchronized audio/video playhead simulation with interactive timeline scrubbing, speaker participation tracks, and smooth auto-scrolling.
> - **Zero-Latency Multi-Speaker Context**: 5 diverse, realistically seeded calls (including an 8-person, 58-minute technical architecture review with 26 diarized turns).
> - **Dynamic Summary Synthesis**: Instant transformation across specialized templates (*Architecture Review*, *Executive Summary*, *Sales Discovery*, *1-on-1 Mentorship*, *Customer Success QBR*) paired with animated loading skeletons.
> - **Actionable Meeting Outputs**: Client-side plain text (`.txt`) and structured JSON (`.json`) transcript downloads, formatted Markdown action item clipboard copying, and highlight clipping (`/clip/:id` and `/share/:id`).
> - **Global Search with Term Highlighting**: Cmd+K dialog searching across transcripts, key decisions, and action items with visual keyword highlighting.
>
> When the user initiates a new call via **"Record with Fathom"** or the **"Start Instant Meeting"** modal, the application simulates the bot joining flow with realistic connection indicators before transitioning directly into the rich post-meeting suite.

---

## 🚀 Core Features Breakdown

### 1. Synchronized Multi-Speaker Playback & Scrubbing
- **Interactive Playhead**: Real-time progress bar with draggable playhead, skip forward/backward (15s), playback speed multiplier (0.75x to 2x), and volume control.
- **Speaker Diarization**: Distinct avatars, roles, and color tracks for all participants (demonstrated on an 8-person engineering call with Sarah, Dev, Elena, Marcus, Priya, Alex, James, and Chloe).
- **Click-to-Seek Dialogue**: Clicking any utterance in the transcript instantly jumps the playhead to that exact second. Active speaker turns auto-scroll smoothly into view.

### 2. Dynamic AI Summary Templates & Smooth Transition State
- **Role-Specific Summary Frameworks**:
  - **Architecture & Engineering Review**: ADR synthesis, system decoupling strategies, database throughput risks, and compliance boundaries.
  - **Executive Summary**: Strategic impact, high-level business milestones, and financial/resource commitments.
  - **Sales Discovery (BANT)**: Budget, Authority, Need, Timeline, competitor flags, and CRM requirements.
  - **1-on-1 Mentorship**: Wins, growth vectors, career progressions, and bilateral manager commitments.
  - **Customer Success / QBR**: Account health scores, feature requests, and contract renewal timeline.
  - **Custom AI Prompt**: Freeform instructions powered server-side by Google Gemini.
- **Subtle Loading Skeleton**: Switching templates triggers an animated shimmer skeleton (overview card, decision pills, and section blocks) before rendering the structured summary with a smooth fade-in transition.
- **Grounded AI Q&A Drawer**: "Ask Fathom AI" chat drawer grounded exclusively in the current call's transcript for instant factual drill-downs.

### 3. Action Items & Key Decisions Management
- **Contextual Action Item Cards**: Displays assignee avatars, due dates, and direct timestamp links jumping to the exact audio moment a task was committed.
- **Interactive Checklists**: Real-time toggleable completion states with instantaneous progress metrics.
- **Single-Click Markdown Copy**: Formats all decisions and checklist tasks into structured Markdown with instant visual feedback (`Copied Markdown!`).
- **External Tool Export**: One-click export simulation to Slack, Notion, and Salesforce.

### 4. Post-Meeting Action Bar & Export Suite
- **Export Transcript Dropdown**:
  - **Plain Text (`.txt`)**: Formats meeting metadata and chronological speaker lines (`[MM:SS] Speaker Name: Utterance`).
  - **Structured JSON (`.json`)**: Exports complete diarized objects with utterance IDs, timestamps, speaker metadata, and summary content.
  - **100% Client-Side**: Uses native Blob APIs with no backend dependencies or data leakage.
- **Moment Clipping & Sharing**:
  - Open the clip modal from any transcript quote or scrubber point.
  - Create shareable snippet links (`/share/[id]`) and isolated clip players (`/clip/[id]`).

### 5. Cmd+K Global Search with Keyword Highlighting
- **Keyboard Shortcut**: Press `Cmd+K` (or `Ctrl+K`) anywhere in the app to summon the global search modal.
- **Multi-Collection Querying**: Searches across transcripts, action items, key decisions, and meeting summaries across all recorded calls.
- **Visual Keyword Highlighting**: Wrapped in high-contrast amber indicator badges (`<mark>`) across matching speaker names, utterance text, and meeting titles.
- **Category Filtering**: Filter results by *All*, *Transcripts*, *Action Items*, or *Highlights*.

### 6. Calendar Integration & Recording Management
- **Schedule Overview**: Upcoming meetings across Zoom, Google Meet, and Microsoft Teams with participant lists and platform badges.
- **Recording Toggles**: Toggle automated bot dispatch on any upcoming event ("Record with Fathom").
- **Ad-Hoc Recording Modal**: Trigger immediate bot joining with custom meeting URLs.

---

## 📂 Seeded Real-World Meeting Scenarios

The application is pre-populated with 5 comprehensive calls covering varied domains, formats, and durations:

| Meeting Title | Platform | Duration | Attendees | Focus Area |
| :--- | :---: | :---: | :---: | :--- |
| **Distributed Architecture & Q4 Scalability Review** | Zoom | 58 min | 8 participants | Strangler Fig migration, PgBouncer pooling, ADR-042 signoff, Kafka GDPR PII |
| **Enterprise Security Discovery — Acme Corp** | Google Meet | 42 min | 4 participants | BANT qualification, SSO/SAML integration, enterprise compliance audit |
| **Engineering 1-on-1: Staff Progression & Sprint Retro** | MS Teams | 28 min | 2 participants | Staff engineer career track, technical all-hands prep, tooling budget |
| **Ad-Hoc Incident Huddle: Postgres Replica Lag** | Zoom | 14 min | 3 participants | Unindexed query remediation, vacuum contention, connection pool recovery |
| **Strategic Customer Success Review — Stripe Integration** | Google Meet | 45 min | 4 participants | Account utilization metrics, webhook sync request, multi-year seat expansion |

---

## 🔍 Session Logger Audits (`.agent-logs/`)

Development exchanges, prompts, and architectural decisions are tracked in `.agent-logs/` using the custom audit tool (`scripts/agent-logger.cjs`).

### Directory Structure
```
.agent-logs/
├── .session-state.json                                             # Active session pointer and exchange counter
├── 2026-09-10_16-47-29_3f9c1a20-77bd-4e51-9a0e-1c2f83b4de77.md    # Session 1 log
└── 2026-09-10_16-47-29_7e2b8c91-12ef-4d33-911b-8f3a09e51a24.md    # Session 2 & feature enhancement audit log
```

### Log Format
Each log contains structured YAML frontmatter followed by chronological, timestamped exchange blocks:
```markdown
---
session_id: 7e2b8c91-12ef-4d33-911b-8f3a09e51a24
date: 2026-09-10
author: hoork2002
model: gemini-3.8-flash
project: fathom-notetaker
total_exchanges: 8
---

[LOG_ENTRY type=PROMPT num=1 session=7e2b8c91]
timestamp: 2026-09-10T16:46:12.800Z
model: gemini-3.8-flash

<prompt content>

[LOG_ENTRY type=RESPONSE num=1 session=7e2b8c91]
timestamp: 2026-09-10T16:46:16.150Z
model: gemini-3.8-flash

<response content>
```

### CLI Commands to Run or Inspect Session Logs

1. **View Current Session State**:
   ```bash
   cat .agent-logs/.session-state.json
   ```

2. **List All Audit Log Files**:
   ```bash
   ls -la .agent-logs/
   ```

3. **Initialize a New Audit Session**:
   ```bash
   node scripts/agent-logger.cjs init-session
   ```

4. **Log an Exchange Turn**:
   ```bash
   node scripts/agent-logger.cjs log-turn \
     --prompt "Summarize user requirement" \
     --response "Summary of architectural changes executed"
   ```

5. **Start a Fresh Session While Logging**:
   ```bash
   node scripts/agent-logger.cjs log-turn \
     --prompt "Initial requirement" \
     --response "Initial response" \
     --new-session
   ```

---

## 🛠️ Local Development & Build

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repo-url>
cd fathom-notetaker

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Binds the Express server and Vite development middleware to `http://localhost:3000`.

### Type-Checking & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
npm start
```
Compiles client assets to `dist/` with Vite, bundles `server.ts` to `dist/server.cjs` via `esbuild`, and launches the production server.

---

## 📄 License & Attribution

Designed and engineered as a high-fidelity homage to **Fathom Video Inc.** Built for demonstration and product evaluation purposes.
