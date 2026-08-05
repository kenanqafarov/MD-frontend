/**
 * Cloudinary Upload Utility for Modern Dentistry CRM
 * Cloud Name: dyb2pz75u
 * API Key: 966895816541691
 */

export async function uploadToCloudinary(file) {
  if (!file) return null;
  const cloudName = "dyb2pz75u";
  const apiKey = "966895816541691";
  const apiSecret = "dLgYPM4KJse-Y-X6zLMk3vzNJK8";
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    // Generate SHA-1 signature using browser Web Crypto API
    const strToHash = `timestamp=${timestamp}${apiSecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(strToHash);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "Cloudinary-yə şəkil yükləmək mümkün olmadı.");
    }

    const result = await res.json();
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
}
