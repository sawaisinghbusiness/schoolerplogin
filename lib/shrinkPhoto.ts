/**
 * Turns a photo from a phone or camera (often 4–10 MB) into a small portrait JPEG, 360×480,
 * cropped to 3:4 with the crop leaning toward the top so faces stay in. About 40–80 KB.
 * Runs in the browser, so the upload is small and works on slow connections.
 */
const W = 360;
const H = 480;

export async function shrinkPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("This is not a photo.");
  if (file.size > 25 * 1024 * 1024) throw new Error("This photo is too big (over 25 MB).");
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file); // honours the phone's rotation
  } catch {
    throw new Error("This photo format can't be used. Save it as JPG or PNG.");
  }
  const want = W / H;
  let sw = bmp.width;
  let sh = bmp.height;
  let sx = 0;
  let sy = 0;
  if (sw / sh > want) {
    sw = sh * want;
    sx = (bmp.width - sw) / 2;
  } else {
    sh = sw / want;
    sy = (bmp.height - sh) * 0.2;
  }
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the photo on this device.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, W, H);
  bmp.close();
  let q = 0.85;
  let out = canvas.toDataURL("image/jpeg", q);
  while (out.length > 300_000 && q > 0.4) {
    q -= 0.15;
    out = canvas.toDataURL("image/jpeg", q);
  }
  return out;
}

/**
 * A scan of a paper (birth certificate, TC, Aadhaar…) as a JPEG no longer than `long` px on its
 * longest side, kept readable but small enough for the backend's 1.5 MB limit.
 */
export async function shrinkDocument(file: File, long = 1600): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a photo or scan (JPG or PNG). PDFs can't be added here.");
  if (file.size > 25 * 1024 * 1024) throw new Error("This file is too big (over 25 MB).");
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("This picture format can't be used. Save it as JPG or PNG.");
  }
  const scale = Math.min(1, long / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the picture on this device.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  let q = 0.82;
  let out = canvas.toDataURL("image/jpeg", q);
  // A data URL is ~4/3 of the bytes; stay well under 1.5 MB.
  while (out.length > 1_400_000 && q > 0.35) {
    q -= 0.12;
    out = canvas.toDataURL("image/jpeg", q);
  }
  if (out.length > 1_950_000) throw new Error("This scan is still too big. Take the photo a little further away.");
  return out;
}
