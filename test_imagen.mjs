import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const res = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A professional baseball player',
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' }
    });
    console.log("Success!");
    console.log(Object.keys(res));
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
test();
