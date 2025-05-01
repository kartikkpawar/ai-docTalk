import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: process.env.TEXT_EMBEDDING_AI_MODEL!,
      input: text.replace(/\n/g, " "),
      encoding_format: "float",
    });
    return response.data[0].embedding;
  } catch (error) {
    console.log("Error calling ai embedding", error);
    throw error;
  }
}
