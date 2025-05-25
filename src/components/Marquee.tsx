"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  images: string[];
  speed?: number;
  moveTowards?: "left" | "right";
}

export default function Marquee({
  images,
  speed = 50,
  moveTowards = "left",
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeImgSize = 450;

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const animationName =
      moveTowards === "right" ? "marquee-right" : "marquee-left";
    const duration = images.length * (marqueeImgSize / speed); // You can tweak this multiplier for better results

    marquee.style.animation = `${animationName} ${duration}s linear infinite`;
  }, [images, speed, moveTowards]);

  return (
    <div className="overflow-hidden w-full">
      <div
        ref={marqueeRef}
        className={`flex w-max animate-marquee whitespace-nowrap`}
      >
        {[...images, ...images].map((src, index) => (
          <div
            key={`${moveTowards}-${index}`}
            className={cn("flex-shrink-0 p-2", `w-[${marqueeImgSize}px]`)} // or use a fixed width
          >
            <div className="aspect-[16/9] rounded-lg overflow-hidden shadow-lg">
              <Image
                width={1280}
                height={720}
                src={src}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
