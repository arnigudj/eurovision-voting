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

  const { data: exists } = await supabase
    .from("users")
    .select("id")
    .eq("nickname", nickname)
    .maybeSingle();

  if (exists) {
    return NextResponse.json(
      { error: "Nickname already taken" },
      { status: 409 }
    );
  }

  const path = `${nickname}/${file.name}`;
  const { url: image_url, error: uploadError } = await uploadToBucket(
    "users",
    path,
    file
  );

  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 500 });
  }

  if(!image_url) {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }

  const { error: insertError } = await supabase
    .from("users")
    .insert({ nickname, image_url });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
