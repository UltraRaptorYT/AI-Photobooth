import { GoogleGenAI, Modality } from "@google/genai";
import { NextResponse } from "next/server";
// import { Buffer } from "buffer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function GET() {
  return NextResponse.json({
    message: "Hello from Gemini API!",
  });
}

export async function POST(req: Request) {
  try {
    const { base64Image, prompt } = await req.json();

    if (!base64Image || !prompt) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // const buffer = Buffer.from(base64Image, "base64");
    // const blob = new Blob([buffer], { type: "image/png" });

    // const file = await ai.files.upload({
    //   file: blob,
    // });

    const contents = [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image,
            },
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash-preview-image-generation",
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
      contents: contents,
    });

    for await (const chunk of response) {
      const parts = chunk?.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData) {
          return NextResponse.json({ base64: part.inlineData.data });
        }
      }
    }

    return NextResponse.json(
      { error: "No valid image response." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in generate POST:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
