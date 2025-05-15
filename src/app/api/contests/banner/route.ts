import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;
  const id = form.get("id");

  if (!file || typeof id !== "string") {
    return NextResponse.json(
      { error: "Missing file or contest id" },
      { status: 400 }
    );
  }

  const filePath = `${id}/banner-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("banners")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("banners")
    .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

  if (signedUrlError) {
    return NextResponse.json(
      { error: signedUrlError.message },
      { status: 500 }
    );
  }

  const signedUrl = signedUrlData?.signedUrl;

  if (!signedUrl) {
    return NextResponse.json(
      { error: "Failed to get public URL" },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("contests")
    .update({ banner_url: signedUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: signedUrl });
}
