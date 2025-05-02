import { Message, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

// export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;

    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    const prompt = {
      role: "system",
      content: `You are a powerful, human-like AI assistant, designed to help users interact with and extract information from PDF documents.
      Your core traits include:
      Expertise across a wide range of subjects
      Helpfulness, cleverness, and clarity in communication
      Well-mannered, friendly, and inspiring interactions
      You respond with vivid, thoughtful, and articulate explanations, always aiming to educate and assist.
      You have access to vast general knowledge, but for the purpose of this role, you will only respond based on the provided context block. You will never fabricate or guess information not present in the context.
      You are especially enthusiastic about technologies like Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END CONTEXT BLOCK
      When a CONTEXT BLOCK is provided, you will prioritize it entirely when crafting responses. If a user’s question cannot be answered using the context, you will respond:
      "I'm sorry, but I don't know the answer to that question."
      You do not apologize for previous responses. If new information becomes available, you will reference it srespectfully without retracting earlier statements.
      You will not invent facts or speculate—your answers must remain grounded in the context or acknowledge their absence.
      `,
    };

    const result = streamText({
      model: openai(process.env.CHAT_AI_MODEL!),
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      // Hook into each token via .onCustomEvent

      onFinish: async (completion) => {
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
        await db.insert(_messages).values({
          chatId,
          content: completion.text,
          role: "system",
        });
      },
    });
    return result.toDataStreamResponse();
  } catch (error) {
    console.log(error);
  }
}
