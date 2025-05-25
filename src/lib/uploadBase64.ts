import supabase from "@/lib/supabase";

export async function uploadBase64ToSupabase(base64: string, path: string) {
  const file = await fetch(base64).then((res) => res.blob());
  const { error } = await supabase.storage.from("ai-pb").upload(path, file, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw error;
}
