"use client";

import Marquee from "@/components/marquee";
import { useEffect, useState } from "react";

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function getImages() {
      const res = await fetch("/api/gallery");
      const { data, error } = await res.json();

      if (error) {
        console.error("API Error:", error);
        return;
      }
      const repeatValue = 4;
      let filledImages: string[] = [...data];
      while (filledImages.length < repeatValue) {
        filledImages.push(...data);
      }
      filledImages = filledImages.slice(0, repeatValue);

      setImages(filledImages);
    }

    getImages();
  }, []);

  return (
    <div className="grow w-full flex flex-col justify-around p-12">
      <Marquee images={images} speed={75} moveTowards="left" />
      <Marquee images={images} speed={75} moveTowards="right" />
      <Marquee images={images} speed={75} moveTowards="left" />
    </div>
  );
}
