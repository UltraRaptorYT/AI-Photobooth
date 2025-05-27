export async function applyWatermark({
  base64Image,
  watermarkUrl = "/watermark.svg",
  text = "sgyouthai",
  opacity = 0.35,
  scale = 0.1,
  marginX = 25,
  marginY = 45,
}: {
  base64Image: string;
  watermarkUrl?: string;
  text?: string;
  opacity?: number;
  scale?: number;
  marginX?: number;
  marginY?: number;
}): Promise<string> {
  const image = new Image();
  const watermark = new Image();

  // Wait for both image and watermark to load
  await Promise.all([
    new Promise<void>((res, rej) => {
      image.onload = () => res();
      image.onerror = rej;
      image.src = base64Image;
    }),
    new Promise<void>((res, rej) => {
      watermark.onload = () => res();
      watermark.onerror = rej;
      watermark.src = watermarkUrl;
    }),
  ]);

  // Wait for fonts to be ready (important!)
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  ctx.drawImage(image, 0, 0);

  const wmWidth = canvas.width * scale;
  const wmHeight = wmWidth * (watermark.naturalHeight / watermark.naturalWidth);

  ctx.globalAlpha = opacity;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    watermark,
    canvas.width - wmWidth - marginX,
    canvas.height - wmHeight - marginY,
    wmWidth,
    wmHeight
  );
  ctx.globalAlpha = 1;

  if (text) {
    const fontSize = canvas.width * 0.02;
    ctx.font = `${fontSize}px "Frankfurter", "Verdana", "Arial", sans-serif`;
    ctx.fillStyle = `rgba(255,255,255,${opacity * 2})`;
    ctx.strokeStyle = `rgba(0,0,0,${opacity})`;
    ctx.lineWidth = 4;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.strokeText(
      text,
      canvas.width - wmWidth / 2 - marginX,
      canvas.height - marginY + 5
    );
    ctx.fillText(
      text,
      canvas.width - wmWidth / 2 - marginX,
      canvas.height - marginY + 5
    );
  }

  return canvas.toDataURL("image/png");
}
