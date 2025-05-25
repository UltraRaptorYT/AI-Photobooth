"use client";

import supabase from "@/lib/supabase";
import { uploadBase64ToSupabase } from "@/lib/uploadBase64";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import CostumeSelector from "@/components/CostumeSelector";
import { toast } from "sonner";
import Image from "next/image";

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
        event.preventDefault();
        // capture();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [capture, capturedImage]);

  function generatePrompt(tags: string): string {
    return `Enhance this real photograph by realistically adding ${tags} to the people in the image. Do not turn anyone into a cartoon or drawing. Keep all faces photorealistic, clearly visible, and unaltered. Do not change the background or lighting. Only add accessories or visual effects around the heads, shoulders, or bodies of each person, and ensure the composition remains in a 16:9 ratio. The image should retain its natural realism and original environment.`;
  }

  const generate = async () => {
    if (!capturedImage || isGenerating) return;

    setIsGenerating(true);
    setAiImage("");

    const prompt = generatePrompt(accessories);
    console.log(prompt);

    async function toBase64(fileOrBlob: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(fileOrBlob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    }

    let base64Image: string;

    if (capturedImage.startsWith("data:image/")) {
      base64Image = capturedImage.split(",")[1];
    } else {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const fullBase64 = await toBase64(blob);
      base64Image = fullBase64.split(",")[1];
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: base64Image,
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
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
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

  const resetFunc = () => {
    setAiImage(null);
    setCapturedImage(null);
    setAccessories("");
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
          <h2 className="text-xl font-bold mb-4">Your AI Masterpiece</h2>
          <div className="flex items-center justify-center gap-12 p-12">
            <img
              alt="AI Edited Image"
              src={aiImage}
              className="mx-auto border rounded aspect-video w-9xl object-contain"
            />
            <div className="flex flex-col items-center justify-center gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  🎉 You Look Awesome!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Scan the QR code below to save your masterpiece.
                </p>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/download?imageId=${imageId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${process.env.NEXT_PUBLIC_BASE_URL}/download?imageId=${imageId}`}
                  alt={`QR Code - ${process.env.NEXT_PUBLIC_BASE_URL}/download?imageId=${imageId}`}
                  width={300}
                  height={300}
                />
              </a>
            </div>
          </div>
          <div className="mt-6 flex gap-6">
            <Button onClick={tryAgainFunc}>Try a Different Look</Button>
            <Button onClick={resetFunc} variant={"destructive"}>
              Retake Photo
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
