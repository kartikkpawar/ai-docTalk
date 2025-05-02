import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

// export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: openai(process.env.CHAT_AI_MODEL!),
      messages,
    });
    return result.toDataStreamResponse();
  } catch (error) {
    console.log(error);
  }
}
