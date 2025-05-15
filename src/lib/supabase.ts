import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadToBucket(
  bucket: string,
  filePath: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const expiresInSeconds = 60 * 60 * 24; // default 24h
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresInSeconds);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return {
      url: null,
      error: signedUrlError?.message || "Failed to get signed URL",
    };
  }

  return { url: signedUrlData.signedUrl, error: null };
}


