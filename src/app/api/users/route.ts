import { supabase, uploadToBucket } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;
  const nickname = form.get("nickname")?.toString().trim();

  if (!file || !nickname) {
    return NextResponse.json(
      { error: "Missing nickname or image" },
      { status: 400 }
    );
  }

  const path = `${Date.now()}/${file.name}`;
  const { url: image_url, error: uploadError } = await uploadToBucket(
    "userss",
    path,
    file
  );

  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 500 });
  }

  if (!image_url) {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }

  const { data, error: insertError } = await supabase
    .from("users")
    .insert({ nickname, image_url })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
