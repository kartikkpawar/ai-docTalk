import { loadS3IntoPineCone } from "@/lib/pinecone";
import { NextResponse } from "next/server";

// /api/create-chat/
export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { fileKey, fileName } = body;
    const pages = await loadS3IntoPineCone(fileKey);
    return NextResponse.json({ message: "File uploaded successfully", pages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
