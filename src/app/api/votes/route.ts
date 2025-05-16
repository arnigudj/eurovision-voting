import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { user_id, ranking } = await req.json();

  if (!user_id || !Array.isArray(ranking)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: contest, error: contestError } = await supabase
    .from("contests")
    .select("id, votes_locked")
    .eq("active", true)
    .single();

  if (contestError || !contest?.id) {
    return NextResponse.json({ error: "No active contest" }, { status: 404 });
  }

  if (contest.votes_locked) {
    return NextResponse.json(
      { error: "Voting is closed for this contest" },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("votes").upsert(
    {
      contest_id: contest.id,
      user_id,
      ranking,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "contest_id,user_id" } // ✅ explicitly handle conflict on this unique key
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const { data: contest } = await supabase
    .from("contests")
    .select("id")
    .eq("active", true)
    .single();

  if (!contest?.id) {
    return NextResponse.json({ error: "No active contest" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("votes")
    .select("ranking")
    .eq("contest_id", contest.id)
    .eq("user_id", user_id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data?.ranking ?? []);
}
