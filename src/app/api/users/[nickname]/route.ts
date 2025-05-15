import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { User } from "../types";
import { ApiError } from "../../types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ nickname: string }> }
): Promise<NextResponse<User | ApiError>> {
  const { nickname } = await params;

  if (!nickname) {
    return NextResponse.json({ error: "Missing nickname" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, nickname, image_url, created_at")
    .eq("nickname", nickname)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
