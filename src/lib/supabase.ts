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
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);


    if (!data?.publicUrl) {
      return {
        url: null,
        error: 'Failed to get public URL',
      };
    }
  
    return { url: data.publicUrl, error: null };
}


