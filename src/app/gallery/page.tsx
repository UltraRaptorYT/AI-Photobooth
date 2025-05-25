"use client";

import Marquee from "@/components/marquee";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const supabaseImageURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-pb`;

  async function getEditedImages() {
    const { data, error } = await supabase
      .from("aipb_images")
      .select("edited_image")
      .order("created_at", { ascending: true });

    if (error || !data) {
      console.error("Supabase DB Error:", error);
      return;
    }

    const validUrls = data
      .map((d) => d.edited_image)
      .filter((url): url is string => !!url)
      .map((url) => `${supabaseImageURL}/${url}`); // remove nulls

    // Repeat if needed for Marquee
    const minPerMarquee = 6;
    let filledImages = [...validUrls];
    while (filledImages.length < minPerMarquee * 3) {
      filledImages.push(...validUrls);
    }

    setImages(filledImages);
  }

  useEffect(() => {
    getEditedImages();

    // 2️⃣ Realtime update when `edited_image` is added
    const channel = supabase
      .channel("realtime-edited-images")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aipb_images",
        },
        (payload) => {
          getEditedImages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔄 Split into per-marquee chunks
  const getMarqueeImages = (startIndex: number): string[] => {
    const min = 6;
    if (images.length === 0) return [];

    const result: string[] = [];
    for (let i = 0; i < min; i++) {
      const index = (startIndex + i) % images.length;
      result.push(images[index]);
    }

    return result;
  };

  return (
    <div className="grow w-full flex flex-col justify-around p-12 overflow-hidden max-h-screen gap-3">
      <Marquee
        key={`top1-${images[0]}`}
        images={getMarqueeImages(0)}
        speed={75}
        moveTowards="left"
      />
      <Marquee
        key={`top2-${images[0]}`}
        images={getMarqueeImages(6)}
        speed={75}
        moveTowards="right"
      />
      <Marquee
        key={`top3-${images[0]}`}
        images={getMarqueeImages(12)}
        speed={75}
        moveTowards="left"
      />
    </div>
  );
}
