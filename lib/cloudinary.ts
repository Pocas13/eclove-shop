import crypto from "node:crypto";

export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadProductImage(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary não configurado.");
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_FOLDER || "eclove/produtos";
  const transformation = "c_limit,w_2000,h_2000,q_auto:good,f_auto";
  const signatureBase = `folder=${folder}&timestamp=${timestamp}&transformation=${transformation}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("transformation", transformation);
  form.append("signature", signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form, cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Cloudinary ${response.status}`);
  return { url: String(payload.secure_url), publicId: String(payload.public_id), width: payload.width, height: payload.height, bytes: payload.bytes };
}
