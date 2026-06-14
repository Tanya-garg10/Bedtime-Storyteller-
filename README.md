# 🌌 Bedtime Storyteller

A beautifully comforting, interactive child-friendly bedtime story companion. Crafted using **React 19**, **Vite**, **Tailwind CSS v4**, and **Framer Motion**, and powered by state-of-the-art **Google Gemini 3.5 Flash** models, **Bedtime Storyteller** helps parents craft gentle, age-appropriate bedtime fairytales with targeted moral lessons that weave cozy, sleepy narratives to ease little ones into a peaceful, warm slumber.

<p align="center">
  <b>Made with ❤️ for little dreamers & tired parents everywhere. ✨</b>
</p>

## ✨ Core Features

*   **🪄 Magic Bedtime Dashboard**: An intuitive, kid-friendly console where you can input your child's **Name**, **Age**, select or randomize custom magical **Companion Heroes** (e.g., a shy dragon, a sleepy moon mouse), and select a calming **Moral Theme**.
*   **📖 Curated Bedtime Themes & Morals**: Choose from gentle comforting lessons like *The Magic of Kindness*, *Sharing Cozy Things*, *Overcoming the Dark*, or unleash your creativity by inputting completely custom moral guides dynamically.
*   **🛌 Dreamer Canopy Mode**: An eye-safe, gorgeous fullscreen night-projection reading stage. Styled with soft off-whites, a midnight indigo canvas, glowing star clusters, and clean typography designed to be read to children under soft bedroom lighting without harmful screen glare.
*   **📚 My Bedtime Shelf & Log Book**: Save your favorite stories permanently into a beautiful, persistent digital bookshelf. Features custom parent rating scales, read trackers, and a personal journal area for parent memory notes.
*   **⚡ Serverless & Production Optimized**: Fully optimized for **Vercel Serverless** and traditional Node environments with separate back-end API proxies that shield your private Google Gemini API keys completely from the client side.

## 🛠️ The Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, and `motion` (Framer Motion) for fluid, physics-friendly animations.
*   **Backend & Orchestration**: Node.js, Express Router for local builds, and **Vercel serverless functions** (`@vercel/node`) for cloud deployments.
*   **AI Engine**: Official `@google/genai` SDK using the super fast, creative `gemini-3.5-flash` model.
*   **Persistence**: Secure, lightweight JSON schemas saved dynamically on local browser storage (`localStorage`).

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

## 🔮 Future Improvements & Roadmap

We aim to expand **Bedtime Storyteller** into a fully immersive, sensory sleep companion. Here is our roadmap:

*   **🎙️ Soft Whispered Audio Narration**: Integration of whispered, soothing Text-to-Speech voices with custom sleepy pacing and long restful pauses designed specifically to ease children into sleep.
*   **🎶 Generative Ambient Soundscapes**: Background audio synthesis introducing delicate, low-frequency sounds (e.g., crackling hearth, whispering wind, gentle summer rain, or warm ocean waves) that match the geographic location of the fairytale.
*   **🎨 Dynamic Cozy Vector Illustrations**: Integration of gentle, hand-drawn vector art models to dynamically paint beautiful, child-focused illustrations of the custom hero (e.g., the little green dragon) directly onto the reading board.
*   **🌙 Sleeping Habits & Chapter Sequels**: A daily streak reminder engine paired with smart sequencing to generate consecutive multi-chapter books (e.g., *"Part 2: The Moon Mouse's Great Harvest"*) that build positive bedtime habits.
*   **☁️ Collaborative Cloud Bookshelf**: Real-time multi-device cloud synchronization using lightweight durable storage adapters (like Firestore) so parents can co-manage ratings and story libraries simultaneously.

<p align="center">
  <b>Made with ❤️ by Bedtime Storyteller Team</b><br/>
  <i>Crafting sweet dreams, one cozy pixel at a time. ⭐</i>
</p>

