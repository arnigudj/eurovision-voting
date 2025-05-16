import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";



export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: user_id } = await params;

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_groups")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
