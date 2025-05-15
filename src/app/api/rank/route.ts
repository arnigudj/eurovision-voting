import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contest_id = searchParams.get("contest_id");

  if (!contest_id) {
    return NextResponse.json({ error: "Missing contest_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("rank")
    .select("ranking")
    .eq("contest_id", contest_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { contest_id, ranking } = await req.json();

  if (!contest_id || !Array.isArray(ranking) || ranking.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("rank")
    .upsert({ contest_id, ranking, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
