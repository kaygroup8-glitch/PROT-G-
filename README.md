# Protégé: Learn Anything by Teaching It

Protégé is an active recall learning platform built on the **Feynman Technique** and **Socratic dialogue**. Instead of quizzing you with static flashcards or multiple-choice questions, Protégé reverses the roles: **you step up to the podium as the teacher, and an AI apprentice learns from your words**.

The apprentice starts with zero assumptions and no textbooks. When you explain a concept, it reconstructs your causal chain, pinpoints missing links, and asks targeted questions until your mental model is complete.

---

## Table of Contents

- [Key Features](#key-features)
- [How It Works (The Feynman Loop)](#how-it-works-the-feynman-loop)
- [Curriculum Tracks](#curriculum-tracks)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running in Development](#running-in-development)
- [Production & Deployment](#production--deployment)
  - [Deploying on Render](#deploying-on-render)
  - [Deploying on Google Cloud Run](#deploying-on-google-cloud-run)
  - [Deploying with Docker](#deploying-with-docker)
- [Project Structure](#project-structure)
- [Security & Privacy](#security--privacy)
- [License](#license)

---

## Key Features

- **Reversed Pedagogical Model**: You act as the instructor. Teaching forces active recall, reveals cognitive blind spots, and solidifies deep mechanical understanding.
- **AssemblyAI Universal-2 Voice Pipeline**: Speak naturally into your microphone. Voice input is transcribed with high accuracy via an AssemblyAI speech pipeline with automatic retry resilience.
- **Server-Side Socratic Engine**: Powered by Google Gemini. Protégé audits explanations against strict causal requirements without giving away answers or regurgitating textbook text.
- **Visual Apprentice State (Living Orb)**: An interactive audio-reactive canvas orb reflects the apprentice's state (listening, assimilating, inquiring, or mastered).
- **Curated Multi-Stage Foundations**: 15 concepts across 5 domains spanning computing, physics, medicine, economics, and philosophy.
- **Custom Topic Sandbox**: Teach any concept, theorem, or question from your own coursework, work projects, or curiosity.
- **Local Progress & Transcript Archive**: Tracks your daily teaching streaks, earned XP, mastered concepts, and full session conversation transcripts stored securely on your local device.

---

## How It Works (The Feynman Loop)

```
       [ 1. Select Concept ]
                 │
                 ▼
     [ 2. Explain in Plain Words ]  ◄── (Voice via AssemblyAI or Typed)
                 │
                 ▼
  [ 3. Apprentice Mental Model Audit ] ◄── (Gemini Causal Verification)
                 │
                 ▼
     [ 4. Targeted Socratic Question ]
                 │
                 ▼
      [ 5. Close the Causal Gap ]
                 │
                 ▼
     [ 6. Mastery & Local Archive ]
```

1. **Choose a Concept**: Pick from curated foundational tracks or type any topic.
2. **Explain the Mechanism**: Speak or type step-by-step how the concept works. Protégé bans buzzwords and demands observable causes and effects.
3. **Apprentice Audit**: Protégé reconstructs its internal understanding, displaying what it grasped and highlighting missing links.
4. **Socratic Exchange**: Protégé asks a targeted question focusing on the single weakest point in your explanation.
5. **Bridge the Gap**: Explain the missing cause to complete the chain and earn mastery points.

---

## Curriculum Tracks

| Domain | Curated Foundations |
| :--- | :--- |
| **Tech, AI & Cryptography** | Public Key Cryptography, Transformer LLMs Token Prediction, Distributed Consensus |
| **Science, Physics & Space** | Newton's Third Law & Rocketry, Doppler Effect & Cosmic Expansion, Quantum Superposition |
| **Biology & Neuroscience** | Photosynthesis & Solar Energy, mRNA Vaccines & Immune Training, Synaptic Action Potentials |
| **Economics & Human Systems** | Supply-Demand Equilibrium, Compound Interest & Exponential Growth, Fractional Reserve Banking |
| **Philosophy & First Principles** | Bayes' Theorem & Belief Updating, The Hard Problem of Consciousness, Occam's Razor |

---

## Tech Stack & Architecture

### Frontend
- **React 18**: Modular functional components and hooks.
- **TypeScript**: Full end-to-end type safety for concepts, transcripts, and model state.
- **Tailwind CSS**: Modern layout system, neutral color tokens, responsive design.
- **HTML5 Web Audio & Canvas**: Custom reactive canvas orb reflecting speech input volume and state.
- **Lucide React**: Clean iconography.

### Backend & API
- **Node.js & Express**: High-performance HTTP server running on port `3000`.
- **Google Gemini API (`@google/genai`)**: Socratic dialogue reasoning, reconstruction generation, and dynamic challenge synthesis.
- **AssemblyAI**: High-accuracy speech-to-text transcription engine.
- **esbuild Bundler**: Builds the backend into a single standalone `dist/server.cjs` bundle for fast container cold-starts.

---

## Getting Started

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher
- **Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **AssemblyAI API Key**: Free key from [AssemblyAI](https://www.assemblyai.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/protege.git
   cd protege
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env.local` or `.env` file in the project root:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your API credentials:

```env
# Google Gemini API key (Server-side reasoning)
GEMINI_API_KEY="your_actual_gemini_api_key"

# AssemblyAI API key (Voice transcription)
ASSEMBLYAI_API_KEY="your_actual_assemblyai_api_key"

# Optional: Host URL
APP_URL="http://localhost:3000"
```

> **Security Note**: Never commit `.env` or `.env.local` to Git. Both are included in `.gitignore` by default.

### Running in Development

Start the development server with Hot Module Reloading and the live Express backend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production & Deployment

### Build Command
Compile the client assets with Vite and bundle the backend with esbuild:

```bash
npm run build
```

This generates:
- `dist/`: Client static bundle (HTML, JS, CSS, assets)
- `dist/server.cjs`: Standalone CommonJS Express server

### Start Command
Run the compiled server:

```bash
npm start
```

---

### Deploying on Render

Render is the recommended hosting platform for Protégé because it natively supports persistent Node.js Express servers.

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Add the following **Environment Variables** in the Render settings:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key
   - `PORT`: `3000`
5. Click **Create Web Service**.

---

### Deploying on Google Cloud Run

To deploy to Google Cloud Run using Docker:

1. Build the container image:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/protege
   ```

2. Deploy the service:
   ```bash
   gcloud run deploy protege \
     --image gcr.io/YOUR_PROJECT_ID/protege \
     --platform managed \
     --port 3000 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY="your_key",ASSEMBLYAI_API_KEY="your_key"
   ```

---

## Project Structure

```
├── .env.example                # Template for required environment variables
├── .env.local                  # Local API keys (ignored by git)
├── .gitignore                  # Git ignore rules for node_modules and .env files
├── index.html                  # Main HTML entry point
├── metadata.json               # Application metadata and permissions
├── package.json                # Project dependencies and build scripts
├── server.ts                   # Express server entry point with Vite middleware
├── server/
│   ├── geminiService.ts        # Server-side Gemini AI Socratic reasoning engine
│   └── voiceService.ts         # AssemblyAI voice transcription proxy
├── src/
│   ├── App.tsx                 # Main application controller and view routing
│   ├── main.tsx                # React DOM root mounting
│   ├── index.css               # Clean typography, borders, and animations
│   ├── types.ts                # TypeScript interfaces and shared types
│   ├── components/
│   │   ├── AliveOrb.tsx        # Dynamic canvas-based reactive apprentice orb
│   │   ├── ConceptSelectView.tsx # Curriculum track selector and custom topic builder
│   │   ├── HistoryModal.tsx    # Teaching history archive and transcript viewer
│   │   ├── LandingView.tsx     # Hero overview, methodology, and session preview
│   │   ├── ProtegeMark.tsx     # Vector brand mark
│   │   ├── ReconstructionView.tsx # Final causal breakdown and mastery diff
│   │   ├── StudentQuestionView.tsx # Socratic dialogue and speech interface
│   │   └── TeachingPodiumView.tsx # Primary teacher microphone desk
│   ├── data/
│   │   └── curatedConcepts.ts  # Curated concept library with editorial imagery
│   └── services/
│       ├── storageService.ts   # LocalStorage history and XP persistence
│       ├── soundService.ts     # Interface sound effects and audio feedback
│       ├── userProfile.ts      # User preferences and learning goals
│       ├── voice/
│       │   └── VoiceManager.ts # AssemblyAI recording and transcription client
│       └── voiceGuideService.ts # Apprentice spoken voice feedback
└── vite.config.ts              # Vite bundler configuration
```

---

## Security & Privacy

- **Server-Side API Key Isolation**: Neither your Gemini API key nor AssemblyAI key is ever transmitted to the browser. All AI reasoning and audio transcription requests are proxied securely through the Express backend `/api/*` routes.
- **Local-First Data Storage**: Your session notes, mastery achievements, streak counts, and full conversation transcripts are stored in your browser's local storage. No user accounts or personal databases are required.
- **Audio Privacy**: Voice recordings are processed in memory and sent directly to AssemblyAI for transcription. Audio buffers are not stored permanently on disk.

---

## License

MIT License. Feel free to use, modify, and distribute this project for educational and personal use.
