import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables for local testing
dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(apiKey: string): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return aiClient;
}

// Vercel Serverless Function handler
export default async function handler(req: any, res: any) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { name, age, character, theme } = req.body;

    if (!name || !age || !character || !theme) {
      return res.status(400).json({
        error: "Missing required story fields: name, age, character, and theme are required.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in Vercel Environment Variables.",
      });
    }

    const ai = getAiClient(apiKey);
    
    const prompt = `Write a soothing bedtime story for a ${age}-year-old named ${name}. The protagonist is ${character}. The moral of the story is ${theme}. Use simple vocabulary, sensory details, and end with a sleepy, calming conclusion.`;

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
        temperature: 0.85,
      },
    });

    const storyText = response.text;
    if (!storyText) {
      throw new Error("Gemini returned an empty story response.");
    }

    return res.status(200).json({ story: storyText });
  } catch (error: any) {
    console.error("Story generation failed on Vercel:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred while generating the bedtime story.",
    });
  }
}
