"use client";

import supabase from "@/lib/supabase";
import { uploadBase64ToSupabase } from "@/lib/uploadBase64";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import CostumeSelector from "@/components/CostumeSelector";
import { toast } from "sonner";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [accessories, setAccessories] = useState("");
  const [imageId, setImageId] = useState<string | null>(null);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);

      const filename = `${crypto.randomUUID()}.png`;
      const originalPath = `original/${filename}`;

      await uploadBase64ToSupabase(imageSrc, originalPath);

      const { data, error } = await supabase
        .from("aipb_images")
        .insert({ original_image: originalPath })
        .select("id");

      if (error || !data) {
        console.error("DB insert error:", error);
        alert("Failed to save image metadata");
        return;
      }

      setImageId(data[0].id);
      setStep(1);
      setAiImage("");
      setAccessories("");
    }
  }, []);

  useEffect(() => {
    if (step == 1) {
      setTimeout(() => {
        selectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else if (step == 2) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code.startsWith("Control")) {
        event.preventDefault(); // Prevent page scroll on spacebar
        // capture();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [capture, capturedImage]);

  function generatePrompt(tags: string): string {
    return `Enhance this real photograph by realistically adding ${tags} to the person in the image. Do not change the person's face or turn them into a cartoon. Keep the facial features photorealistic and untouched. Do not alter the background or lighting. Only add accessories or effects around the head, shoulders, or body, and ensure the image remains in a 16:9 ratio.`;
  }

  const generate = async () => {
    if (!capturedImage || isGenerating) return;

    setIsGenerating(true);
    setAiImage("");

    const prompt = generatePrompt(accessories);
    console.log(prompt);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: capturedImage.split(",")[1],
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Non-200 response from /api/generate:", errorData);
        throw new Error(
          errorData?.error?.message ||
            `AI generation failed: ${response.status}`
        );
      }

      const json = await response.json();

      if (!json.base64) {
        throw new Error("No base64 image returned from generation.");
      }

      const editedFilename = `${imageId}.png`;
      const editedPath = `edited/${editedFilename}`;

      await uploadBase64ToSupabase(
        `data:image/png;base64,${json.base64}`,
        editedPath
      );

      await supabase
        .from("aipb_images")
        .update({ edited_image: editedPath })
        .eq("id", imageId);

      setAiImage(`data:image/png;base64,${json.base64}`);
      setStep(2);
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const tryAgainFunc = () => {
    setAccessories("");
    setStep(1);
    setTimeout(() => {
      setAiImage(null);
    }, 500);
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
          className="mx-auto rounded-lg px-12 w-9xl"
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
          <h2 className="text-xl font-bold mb-4 text-center">
            Pick Your Look!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-12 mx-auto">
            <img
              src={capturedImage}
              alt="Captured"
              className="border max-w-full mx-auto"
            />
            <div className="flex flex-col items-center justify-center">
              {/* <div className="space-y-4 w-full">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {accessoriesList.map((item) => (
                    <div
                      key={item.value}
                      onClick={() => setAccessories(item.value)}
                      className={`min-w-[120px] flex-shrink-0 cursor-pointer border-2 rounded-lg p-2 text-center transition-all ${
                        accessories === item.value
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <Image
                        width={100}
                        height={100}
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
                    Or type your own Accessories idea:
                  </p>
                  <input
                    type="text"
                    value={accessories}
                    onChange={(e) => setAccessories(e.target.value)}
                    disabled={isGenerating}
                    placeholder="e.g. pirate with rainbow cape"
                    className="border rounded p-2 w-full max-w-md"
                  />
                </div>
              </div> */}
              <CostumeSelector
                onUpdatePrompt={(value) => setAccessories(value)}
                disabled={isGenerating}
              />

              <div className="text-center mt-6">
                <Button
                  onClick={generate}
                  disabled={!accessories || isGenerating}
                  size="lg"
                >
                  {isGenerating ? "Generating..." : "Generate AI Photo"}
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
          <img
            alt="AI Edited Image"
            src={aiImage}
            className="mx-auto border rounded aspect-video w-9xl object-contain"
          />
          <div className="mt-6">
            <Button onClick={tryAgainFunc}>Try Again</Button>
          </div>
        </section>
      )}
    </div>
  );
}
