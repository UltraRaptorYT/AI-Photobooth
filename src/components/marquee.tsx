// components/Marquee.tsx
"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const animationName =
      moveTowards === "right" ? "marquee-right" : "marquee-left";

    const duration = images.length * (300 / speed); // Adjusted multiplier

    marquee.style.animation = `${animationName} ${duration}s linear infinite`;
  }, [images, speed, moveTowards]);

  return (
    <div className="overflow-hidden w-full">
      <div ref={marqueeRef} className={`flex whitespace-nowrap`}>
        {[...images, ...images].map((src, index) => (
          <div
            key={`${moveTowards}-${index}`}
            className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-2"
          >
            <div className="aspect-[16/9] rounded-lg overflow-hidden shadow-lg">
              <img
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
