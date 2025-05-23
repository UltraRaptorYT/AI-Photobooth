"use client";

import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Image from "next/image";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const costumes = [
    { label: "Wizard", value: "wizard", img: "/costumes/wizard.png" },
    { label: "Astronaut", value: "astronaut", img: "/costumes/astronaut.png" },
    { label: "Ninja", value: "ninja", img: "/costumes/ninja.png" },
    { label: "Cow Suit", value: "cow suit", img: "/costumes/cow.png" },
    { label: "Pilot", value: "pilot", img: "/costumes/pilot.png" },
    { label: "Cat Suit", value: "cat suit", img: "/costumes/cat.png" },
    { label: "Maid", value: "maid", img: "/costumes/maid.png" },
  ];

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [costume, setCostume] = useState("");

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setAiImage("");
      setCostume("");
      setTimeout(() => {
        selectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code.startsWith("Control")) {
        event.preventDefault(); // Prevent page scroll on spacebar
        capture();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [capture, capturedImage]);

  const generate = async () => {
    if (!capturedImage) return;
    const result = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Image: capturedImage.split(",")[1],
        prompt: `
        You are an AI image generation assistant tasked with modifying existing images by adding costumes to people in the image. Your goal is to seamlessly integrate the specified costume onto the individuals in the image without altering the original composition or regenerating the entire image.

        First, carefully analyze the existing image. Take note of:
        - The number of people in the image
        - Their positions, poses, and proportions
        - The lighting and color scheme of the original image
        - The overall style and mood of the scene

        Now, you will add the following costume to the person or people in the image:

        <costume_description>
        ${costume}
        </costume_description>

        When incorporating the costume:
        - Adapt the costume to fit each person's body shape and pose
        - Ensure the costume looks natural and properly fitted
        - Maintain consistency with the original image's lighting and color palette
        - Preserve facial features and expressions of the individuals

        Important considerations:
        - Do not change the background or any other elements of the original image
        - Maintain the original image's resolution and aspect ratio
        - Ensure the added costume elements blend seamlessly with the existing image

        If the costume description is vague or incomplete, use your best judgment to create a cohesive and appropriate costume based on the available information and the context of the original image.

        Your final output should be the modified image with the costume added to the person or people, maintaining the overall quality and coherence of the original image. Do not include any explanatory text or additional images in your response.
      `,
      }),
    });
    const json = await result.json();
    if (json.base64) {
      setAiImage(`data:image/png;base64,${json.base64}`);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setAiImage(null);
    setCostume("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-24">
      {/* STEP 1: Capture */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={{ width: 1280, height: 720 }}
          className="mx-auto rounded-lg p-12 w-9xl"
        />
        <Button onClick={capture} className="mt-4" variant={"destructive"}>
          Capture Photo
        </Button>
      </section>

      {/* STEP 2: Selection */}
      {capturedImage && (
        <section
          ref={selectionRef}
          className="min-h-screen flex flex-col justify-center items-center"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Choose Costume</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-12 mx-auto">
            <img
              src={capturedImage}
              alt="Captured"
              className="border max-w-full mx-auto"
            />
            <div>
              <h3>Costume</h3>
              <div className="space-y-4 w-full">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {costumes.map((item) => (
                    <div
                      key={item.value}
                      onClick={() => setCostume(item.value)}
                      className={`min-w-[120px] flex-shrink-0 cursor-pointer border-2 rounded-lg p-2 text-center transition-all ${
                        costume === item.value
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-20 h-20 object-contain mx-auto mb-2"
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center w-full">
                  <p className="text-sm text-gray-500 mb-1">
                    Or type your own costume idea:
                  </p>
                  <input
                    type="text"
                    value={costume}
                    onChange={(e) => setCostume(e.target.value)}
                    placeholder="e.g. pirate with rainbow cape"
                    className="border rounded p-2 w-full max-w-md"
                  />
                </div>
              </div>

              <div className="text-center mt-6">
                <Button onClick={generate} disabled={!costume} size={"lg"}>
                  Generate AI Photo
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3: Result */}
      {aiImage && (
        <section
          ref={resultRef}
          className="min-h-screen flex flex-col justify-center items-center text-center"
        >
          <h2 className="text-xl font-bold mb-4">Your AI Photo</h2>
          <img src={aiImage} className="mx-auto border rounded max-w-full" />
          <div className="mt-6">
            <Button onClick={reset}>Try Again</Button>
          </div>
        </section>
      )}
    </div>
  );
}
