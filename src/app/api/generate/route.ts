import { GoogleGenAI, Modality } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

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

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
        };

        const keepAlive = setInterval(() => {
          send({ type: "ping" });
        }, 5000);

        try {
          send({ type: "start" });

          const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash-image",
            config: {
              responseModalities: [Modality.TEXT, Modality.IMAGE],
            },
            contents,
          });

          for await (const chunk of response) {
            const parts = chunk?.candidates?.[0]?.content?.parts;
            if (!parts) continue;

            for (const part of parts) {
              if (part.inlineData?.data) {
                send({ type: "image", base64: part.inlineData.data });
                return;
              }
            }
          }

          send({ type: "error", error: "No valid image response." });
        } catch (error) {
          console.error("Error in generate stream:", error);
          send({ type: "error", error: "Internal server error." });
        } finally {
          clearInterval(keepAlive);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Error in generate POST:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
