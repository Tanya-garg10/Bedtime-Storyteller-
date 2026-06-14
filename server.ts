import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());

// Initialize Gemini SDK lazily to prevent server crash if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in your environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API endpoint to generate bedtime story
app.post("/api/story/generate", async (req, res) => {
  try {
    const { name, age, character, theme } = req.body;

    if (!name || !age || !character || !theme) {
      return res.status(400).json({
        error: "Missing required story fields: name, age, character, and theme are required.",
      });
    }

    const ai = getAiClient();
    
    // Construct prompt template as specified in user request
    const prompt = `Write a soothing bedtime story for a ${age}-year-old named ${name}. The protagonist is ${character}. The moral of the story is ${theme}. Use simple vocabulary, sensory details, and end with a sleepy, calming conclusion.`;

    // Construct precise system instructions for a high-quality soothing bedrock story
    const systemInstruction = `You are an expert children's bedtime storyteller. 
Your goal is to write stories that are incredibly comforting, gentle, and calming to help kids fall asleep.
Strictly adhere to these rules:
1. Tone: Deeply warm, safe, soothing, and cozy.
2. Structure: 
   - A soft beginning introducing the character and setting.
   - A brief, non-scary adventure or scenario illustrating the moral lesson/theme.
   - A progressive relaxation ending where elements in the story go to sleep (e.g., matching the sunset, yawning wind, sleepy stars, closing eyes).
3. Moral integration: Gentle, encouraging, and easy for a child of the specified age to comprehend without sounding overly preachy.
4. Formatting: Write the story of about 300-500 words, split into 4-6 beautiful, readable paragraphs with a title at the start. Use Markdown format (like bolding cozy sensory words occasionally) to make it beautiful to display.
5. Vocabulary: Keep vocabulary simple and appropriate for the specified age of the child. Use sensory details (smell of lavender breeze, softness of mossy clouds, sound of distant lullabies).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85, // Higher value for creative and imaginative bedtime stories as per UX Tip
      },
    });

    const storyText = response.text;
    if (!storyText) {
      throw new Error("Gemini returned an empty story response.");
    }

    res.json({ story: storyText });
  } catch (error: any) {
    console.error("Story generation failed:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred while generating the bedtime story.",
    });
  }
});

// Configure Vite middleware in development or serve built files in production
async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running and listening on http://0.0.0.0:${PORT}`);
  });
}

configureServer().catch((err) => {
  console.error("Failed to start server:", err);
});
