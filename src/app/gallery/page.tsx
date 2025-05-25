"use client";

import Marquee from "@/components/marqueeTemp";
import { useEffect, useState, useCallback } from "react";
import supabase from "@/lib/supabase";

const getMarqueeImages = (images: string[], startIndex: number): string[] => {
  const min = 6;
  if (images.length === 0) return [];

  const result: string[] = [];
  for (let i = 0; i < min; i++) {
    const index = (startIndex + i) % images.length;
    result.push(images[index]);
  }

  return result;
};

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const supabaseImageURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-pb`;

  const getEditedImages = useCallback(async () => {
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
      .map((url) => `${supabaseImageURL}/${url}`);

    const minPerMarquee = 6;
    const filledImages = [...validUrls];
    while (filledImages.length < minPerMarquee * 3) {
      filledImages.push(...validUrls);
    }

    setImages(filledImages);
  }, [supabaseImageURL]);

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
        () => {
          getEditedImages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getEditedImages]);

  return (
    <div className="grow w-full flex flex-col justify-around p-12 overflow-hidden max-h-screen gap-3">
      <Marquee
        key={`marquee1-${images[0]}`}
        images={getMarqueeImages(images, 0)}
        speed={75}
        moveTowards="left"
      />
      <Marquee
        key={`marquee2-${images[0]}`}
        images={getMarqueeImages(images, 6)}
        speed={75}
        moveTowards="right"
      />
      <Marquee
        key={`marquee3-${images[0]}`}
        images={getMarqueeImages(images, 12)}
        speed={75}
        moveTowards="left"
      />
    </div>
  );
}
