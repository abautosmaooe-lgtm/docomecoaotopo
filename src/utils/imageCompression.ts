/**
 * Client-side image compression utility
 * Compresses images before uploading or storing to avoid Firestore 1MB document limit
 * and localStorage 5MB quota errors.
 */

export interface CompressionOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: string;
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxDimension = 1000,
    quality = 0.75,
    mimeType = "image/jpeg"
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale down dimensions proportionally if exceeding maxDimension
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("Canvas context 2D not supported"));
          }

          // Smooth drawing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed dataUrl
          let dataUrl = canvas.toDataURL(mimeType, quality);

          // If still larger than 700KB (approx 950k base64 chars), try a more aggressive compression
          if (dataUrl.length > 700000) {
            dataUrl = canvas.toDataURL("image/jpeg", 0.6);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to server and returns the persistent hosted URL (/api/files/:id)
 * If upload fails or if offline, safely falls back to compressed Base64.
 */
export async function uploadImageToServer(compressedDataUrl: string): Promise<string> {
  if (!compressedDataUrl || !compressedDataUrl.startsWith("data:image/")) {
    return compressedDataUrl;
  }

  try {
    const response = await fetch("/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: compressedDataUrl })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn("Failed to upload image to server, falling back to local dataUrl:", err);
  }

  return compressedDataUrl;
}

/**
 * Safe localStorage setter that traps QuotaExceeded errors gracefully
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    console.warn(`[SafeStorage] Could not write "${key}" to localStorage (Quota exceeded). Falling back without throwing.`);
    // Try clearing old large items if needed, or simply avoid crash
    return false;
  }
}
