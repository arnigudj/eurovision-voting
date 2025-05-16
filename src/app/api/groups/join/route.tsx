import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { user_id, group_id } = await req.json();

  if (!user_id || !group_id) {
    return NextResponse.json(
      { error: "Missing user_id or group_id" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("user_groups")
    .upsert({ user_id, group_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
