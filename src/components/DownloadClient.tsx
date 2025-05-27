"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import supabase from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import StarRating from "@/components/StarRating";
import { applyWatermark } from "@/lib/applyWatermark";

export default function DownloadClient() {
  const searchParams = useSearchParams();
  const imageId = searchParams.get("imageId");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(true);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketPath = `${supabaseURL}/storage/v1/object/public/ai-pb`;

  useEffect(() => {
    if (!imageId) return;

    const fetchImagePaths = async () => {
      const { data, error } = await supabase
        .from("aipb_images")
        .select("original_display_image, edited_display_image")
        .eq("id", imageId)
        .single();

      if (error || !data) {
        console.error("Error loading image paths:", error);
        toast.error("Failed to load images");
        return;
      }

      setOriginalUrl(`${bucketPath}/${data.original_display_image}`);
      setEditedUrl(`${bucketPath}/${data.edited_display_image}`);
      setLoading(false);
    };

    fetchImagePaths();
  }, [imageId]);

  useEffect(() => {
    if (hasSubmitted && bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [hasSubmitted]);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    if (!rating) {
      toast.error("Please leave a rating.");
      return;
    }

    const { error } = await supabase.from("aipb_image_users").insert({
      email,
      subscribed: subscribe,
      image_id: imageId,
      rating: rating,
    });

    if (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed.");
      return;
    }

    toast.success("Thanks for your feedback!");
    setHasSubmitted(true);
  };

  const triggerDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Download failed.");
      console.error("Download error:", error);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-10 text-center">
      <h1 className="text-3xl font-bold leading-snug">
        Thanks for using <br />
        SYAI AI Photobooth!
      </h1>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Enter your email to download your photos and optionally subscribe to our
        updates.
      </p>

      <div className="space-y-6 max-w-sm mx-auto text-left">
        <div className="grid w-full items-center gap-1.5">
          <Label className="block text-base text-left">
            Rate your AI photo
          </Label>
          <StarRating rating={rating} setRating={setRating} />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email" className="text-base">
            Email
          </Label>
          <Input
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            id="email"
          />
        </div>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={subscribe}
            onCheckedChange={(val) => setSubscribe(!!val)}
          />
          Subscribe to mailing list
        </label>

        <Button className="w-full" onClick={handleSubmit}>
          Submit
        </Button>
      </div>

      {hasSubmitted && !loading && (
        <div ref={bottomRef} className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold">Download Your Images</h2>

          <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
            {originalUrl && (
              <div className="flex flex-col items-center space-y-2">
                <Image
                  src={originalUrl}
                  alt="Original"
                  width={320}
                  height={180}
                  className="rounded-lg border"
                />
                <Button
                  className="w-full max-w-[200px]"
                  onClick={() => triggerDownload(originalUrl!, "original.png")}
                >
                  Download Original
                </Button>
              </div>
            )}

            {editedUrl && (
              <div className="flex flex-col items-center space-y-2">
                <Image
                  src={editedUrl}
                  alt="Edited"
                  width={320}
                  height={180}
                  className="rounded-lg border"
                />
                <Button
                  className="w-full max-w-[200px]"
                  onClick={() => triggerDownload(editedUrl!, "edited.png")}
                >
                  Download AI Edited
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
