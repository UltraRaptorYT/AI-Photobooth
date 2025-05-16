"use client";

import { Button } from "@/components/ui/button";
import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";

export default function Home() {
  const [aiImage, setAiImage] = useState<string | null>(null);
  const videoConstraints = {
    width: 1280,
    height: 720,
  };

  const webcamRef = useRef<Webcam>(null);
  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current && webcamRef.current.getScreenshot();
    console.log(imageSrc);
    if (imageSrc) {
      // Convert base64 to Blob
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      const result = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Image: imageSrc.split(",")[1], // Remove the "data:image/png;base64," prefix
          prompt: "add a wizard hat", // your prompt string
        }),
      });

      const json = await result.json();
      if (json.base64) {
        setAiImage(`data:image/png;base64,${json.base64}`);
      }
    } else {
      console.warn("Screenshot failed.");
    }
  }, [webcamRef]);

  return (
    <div style={{ maxWidth: "100%", padding: "1rem", textAlign: "center" }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        videoConstraints={videoConstraints}
        style={{
          width: "100%",
          height: "auto",
        }}
      />
      {aiImage && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">AI Edited Image</h2>
          <img
            src={aiImage}
            alt="AI Result"
            className="border max-w-full mx-auto"
          />
        </div>
      )}

      <Button variant={"destructive"} className="bg-red-500">
        asd
      </Button>
      <Button variant={"destructive"} onClick={capture}>
        Capture photo
      </Button>
    </div>
  );
}
