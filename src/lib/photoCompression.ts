import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";

export type StorageCategory = "animal" | "consultation" | "vaccination" | "farm" | "general";

export interface CompressedPhoto {
  file: File;
  dataUrl: string;
  thumbnail: string;
  bytes: number;
}

const MAX_DIMENSION = 1600;
const THUMB_DIMENSION = 400;
const TARGET_KB = 250;

export async function compressPhoto(file: File): Promise<CompressedPhoto> {
  const compressed = await imageCompression(file, {
    maxSizeMB: TARGET_KB / 1024,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.75,
  });

  const thumbBlob = await imageCompression(file, {
    maxSizeMB: 0.05,
    maxWidthOrHeight: THUMB_DIMENSION,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.7,
  });

  const [dataUrl, thumbnail] = await Promise.all([
    fileToDataUrl(compressed),
    fileToDataUrl(thumbBlob),
  ]);

  return {
    file: compressed as File,
    dataUrl,
    thumbnail,
    bytes: compressed.size,
  };
}

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function recordStorageChange(
  category: StorageCategory,
  bytesDelta: number,
  filesDelta = 0
): Promise<void> {
  const { error } = await supabase.rpc("record_storage_change" as any, {
    p_category: category,
    p_bytes_delta: bytesDelta,
    p_files_delta: filesDelta,
  });
  if (error) console.warn("[storage] record_storage_change failed", error);
}

export async function recomputeStorageUsage(): Promise<void> {
  const { error } = await supabase.rpc("recompute_storage_usage" as any);
  if (error) console.warn("[storage] recompute_storage_usage failed", error);
}

/** Estimate the decoded size in bytes of a base64 data URL. */
export function estimateDataUrlBytes(dataUrl: string): number {
  if (!dataUrl) return 0;
  const i = dataUrl.indexOf(",");
  const b64 = i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
