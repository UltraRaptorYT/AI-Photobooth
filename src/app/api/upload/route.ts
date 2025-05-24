// import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Upload API working sucessfully",
  });
}

export async function POST(req: Request) {
  try {
    const { base64Image } = await req.json();

    if (!base64Image) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }


  } catch (error) {
    console.error("Error in upload POST:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
