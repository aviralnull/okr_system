

"use server";

import { getCurrentUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function getCloudinarySignature(folder: string) {
  const user = await getCurrentUser();

  if (!user.organizationId) {
    throw new Error("User does not belong to an organization");
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    apiSecret
  );

  return {
    timestamp,
    signature,
    folder,
    cloudName,
    apiKey,
  };
}
