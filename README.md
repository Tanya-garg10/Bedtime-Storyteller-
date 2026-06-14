# 🌌 Bedtime Storyteller

A beautifully comforting, interactive child-friendly bedtime story companion. Crafted using **React 19**, **Vite**, **Tailwind CSS v4**, and **Framer Motion**, and powered by state-of-the-art **Google Gemini 3.5 Flash** models, **Bedtime Storyteller** helps parents craft gentle, age-appropriate bedtime fairytales with targeted moral lessons that weave cozy, sleepy narratives to ease little ones into a peaceful, warm slumber.

<p align="center">
  <b>Made with ❤️ for little dreamers & tired parents everywhere. ✨</b>
</p>

---

## ✨ Core Features

*   **🪄 Magic Bedtime Dashboard**: An intuitive, kid-friendly console where you can input your child's **Name**, **Age**, select or randomize custom magical **Companion Heroes** (e.g., a shy dragon, a sleepy moon mouse), and select a calming **Moral Theme**.
*   **📖 Curated Bedtime Themes & Morals**: Choose from gentle comforting lessons like *The Magic of Kindness*, *Sharing Cozy Things*, *Overcoming the Dark*, or unleash your creativity by inputting completely custom moral guides dynamically.
*   **🛌 Dreamer Canopy Mode**: An eye-safe, gorgeous fullscreen night-projection reading stage. Styled with soft off-whites, a midnight indigo canvas, glowing star clusters, and clean typography designed to be read to children under soft bedroom lighting without harmful screen glare.
*   **📚 My Bedtime Shelf & Log Book**: Save your favorite stories permanently into a beautiful, persistent digital bookshelf. Features custom parent rating scales, read trackers, and a personal journal area for parent memory notes.
*   **⚡ Serverless & Production Optimized**: Fully optimized for **Vercel Serverless** and traditional Node environments with separate back-end API proxies that shield your private Google Gemini API keys completely from the client side.

---

## 🛠️ The Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, and `motion` (Framer Motion) for fluid, physics-friendly animations.
*   **Backend & Orchestration**: Node.js, Express Router for local builds, and **Vercel serverless functions** (`@vercel/node`) for cloud deployments.
*   **AI Engine**: Official `@google/genai` SDK using the super fast, creative `gemini-3.5-flash` model.
*   **Persistence**: Secure, lightweight JSON schemas saved dynamically on local browser storage (`localStorage`).

---

## 🏃 Getting Started & Local Installation

### Prerequisites
*   Node.js (v18 or higher recommended)
*   A Google Gemini API key. [Get Key Here](https://aistudio.google.com/)

### Setup Instructions

1. **Clone or Download the Project Sources**:
   ```bash
   git clone <your-repo-link>
   cd bedtime-storyteller
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_goes_here
   ```

4. **Run the developer local server**:
   ```bash
   npm run dev
   ```
   *Your server will boot immediately up on http://localhost:3000*

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploying to Vercel (Step-by-Step)

The project includes an optimized Vercel configuration (`vercel.json`) and a deployment-ready serverless function file inside `api/generate.ts`. This allows you to host it on Vercel with zero cold-starts and maximum safety.

### 1. Push to GitHub
Create a new repository on your GitHub account and push the current repository up:
```bash
git init
git remote add origin <your-github-repo-url>
git add .
git commit -m "feat: setup bedtime storyteller with vercel config"
git branch -M main
git push -u origin main
```

### 2. Import into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. Vercel will automatically detect **Vite** as the framework.

### 3. Configure Gemini Environment Secret
Under the **Environment Variables** section in the Vercel project configuration, add:
*   **Key**: `GEMINI_API_KEY`
*   **Value**: *[Your Google Gemini API Key]* (Never share or leak this key)

### 4. Click Deploy 🚀
Vercel builds and hosts your React client statically, and automatically provisions our API endpoint at `/api/story/generate` to securely fetch bedtime stories via Serverless Nodes.

---

## 🏆 Hackathon / Judges Presentation Blueprint

If you are presenting this project in front of hackathon judges, here is a professional, high-impact **3-Minute Presentation Script & Showcase Order**:

### ⏱️ Minute 1: The Problem & The Narrative
*   **How to start**: *"Good morning/afternoon, Judges. We've all seen children struggling to adjust to wind-down time, glued to bright screens filled with chaotic, fast-triggering animated media that delays sleep. Bedtime is a critical emotional-development phase, but keeping stories comforting, personal, and educational is tough for tired parents."*
*   **Introduce "Bedtime Storyteller"**: *"We built Bedtime Storyteller. It is a full-stack interactive cozy reading console designed specifically to redirect screen time into warm, bonding parent-child reading sessions."*

### ⏱️ Minute 2: live Demo (The Hook)
*   *Keep your inputs ready or click 'Generate'!*
*   **Highlight personalization**: *"Say a 6-year-old child named 'Aria' loves 'Moon Mice' and is struggling with 'gently sharing toys'. Within seconds, Gemini 3.5 Flash crafts a custom, structured bedtime story that guides Aria through the moral lessons of sharing, integrating soft sensory details."*
*   **Explain the Design Science**: Explain why the dashboard isn't a simple white screen:
    *   *Soothing Indigo aesthetics* relax the user's eyes.
    *   *Cozy stars* sprinkle the background with gentle animations keeping children comfortable.

### ⏱️ Minute 3: The Killer Feature & Technical Edge
*   **Show "Dreamer Canopy Mode"**: Transition the active story into *Dreamer Canopy Screen*.
    *   *"As the parent starts reading, they switch into **Dreamer Canopy Mode**. This instantly cleanses the screen from inputs, buttons, or charts, setting an eye-safe night-glow projection with easy-to-read prose. This turns the tablet or laptop into a beautiful cozy bedroom night-lamp page."*
*   **Show "My Bedtime Shelf"**: Show them the local shelf with ratings and parent logs.
    *   *"Parents can save stories permanently to their shelf, track bedtime counts, and leave loving parent memory logs."*
*   **Explain Technical Architecture**:
    *   *"From a tech stack level: We built this with React 19 and Vite. To keep Gemini API calls secure without exposing private keys statically, we designed a serverless Node route matching Vercel's Edge standard. It are zero cost, highly secure, and is ready to scale to millions of nightly readers."*

### 💡 Golden Tips for Hackathon Success:
1.  **Read aloud a short passage**: When demoing, read the generated story ending with a soft, sleepy calm tone to show the judges the high quality, comfort-focused AI generation system.
2.  **Point out the Vercel architecture**: In hackathons, security is scrutinized. Emphasize that your API route fully secures the Gemini Token by housing it server-side.

---

## 🔮 Future Improvements & Roadmap

We aim to expand **Bedtime Storyteller** into a fully immersive, sensory sleep companion. Here is our roadmap:

*   **🎙️ Soft Whispered Audio Narration**: Integration of whispered, soothing Text-to-Speech voices with custom sleepy pacing and long restful pauses designed specifically to ease children into sleep.
*   **🎶 Generative Ambient Soundscapes**: Background audio synthesis introducing delicate, low-frequency sounds (e.g., crackling hearth, whispering wind, gentle summer rain, or warm ocean waves) that match the geographic location of the fairytale.
*   **🎨 Dynamic Cozy Vector Illustrations**: Integration of gentle, hand-drawn vector art models to dynamically paint beautiful, child-focused illustrations of the custom hero (e.g., the little green dragon) directly onto the reading board.
*   **🌙 Sleeping Habits & Chapter Sequels**: A daily streak reminder engine paired with smart sequencing to generate consecutive multi-chapter books (e.g., *"Part 2: The Moon Mouse's Great Harvest"*) that build positive bedtime habits.
*   **☁️ Collaborative Cloud Bookshelf**: Real-time multi-device cloud synchronization using lightweight durable storage adapters (like Firestore) so parents can co-manage ratings and story libraries simultaneously.

---

<p align="center">
  <b>Made with ❤️ by Bedtime Storyteller Team</b><br/>
  <i>Crafting sweet dreams, one cozy pixel at a time. ⭐</i>
</p>

