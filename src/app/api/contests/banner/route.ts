import { supabase, uploadToBucket } from "@/lib/supabase";
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

  const { url, error } = await uploadToBucket("banners", filePath, file);

  if (!url) {
    console.error("Error uploading banner file:", error);
    return NextResponse.json(
      { error: "Failed to upload banner" },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("contests")
    .update({ banner_url: url })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: url });
}
