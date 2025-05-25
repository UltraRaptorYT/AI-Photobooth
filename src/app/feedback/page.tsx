"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

export default function Feedback() {
  const params = useSearchParams();
  const imageId = params.get("imageId");

  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(false);
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
        .select("original_image, edited_image")
        .eq("id", imageId)
        .single();

      if (error || !data) {
        console.error("Error loading image paths:", error);
        toast.error("Failed to load images");
        return;
      }

      setOriginalUrl(`${bucketPath}/${data.original_image}`);
      setEditedUrl(`${bucketPath}/${data.edited_image}`);
      setLoading(false);
    };

    fetchImagePaths();
  }, [imageId]);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    const { error } = await supabase.from("aipb_image_users").insert({
      email,
      subscribed: subscribe,
      image_id: imageId,
    });

    if (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed.");
      return;
    }

    toast.success("Thanks for your feedback!");
    setHasSubmitted(true);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-10 text-center">
      <h1 className="text-3xl font-bold leading-snug">
        Thanks for using <br />
        SYAI AI Photobooth!
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto">
        Enter your email to download your photos and optionally subscribe to our
        updates.
      </p>

      <div className="space-y-4 max-w-sm mx-auto text-left">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
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
        <div className="mt-12 space-y-6">
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
                <Button asChild>
                  <a href={originalUrl} download>
                    Download Original
                  </a>
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
                <Button asChild>
                  <a href={editedUrl} download>
                    Download AI-Edited
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
