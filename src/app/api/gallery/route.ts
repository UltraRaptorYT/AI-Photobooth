import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const bucket = "ai-pb";
  const folder = "original";
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${folder}`;

  const imageUrls = data.map((file) => `${baseUrl}/${file.name}`);

  return NextResponse.json({ data: imageUrls });
}
