import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type BucketName = 'course-videos' | 'course-thumbnails';

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const uploadFile = async (bucket: BucketName, file: File, path: string) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const { error: err } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (err) throw err;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      setProgress(100);
      return { publicUrl: publicUrlData.publicUrl, path };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error(`Error uploading to ${bucket}:`, message);
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (bucket: BucketName, path: string) => {
    try {
      const { error: err } = await supabase.storage
        .from(bucket)
        .remove([path]);
      if (err) throw err;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Remove failed";
      console.error(`Error removing from ${bucket}:`, message);
      throw err;
    }
  };

  const getPublicUrl = (bucket: BucketName, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  return { uploadFile, removeFile, getPublicUrl, isUploading, progress, error };
}
