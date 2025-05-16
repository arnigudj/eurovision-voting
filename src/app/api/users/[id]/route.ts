import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { User } from "../types";
import { ApiError } from "../../types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<User | ApiError>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
