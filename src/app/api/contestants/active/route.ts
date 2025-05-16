import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { Contestant } from "../types";
import { ApiError } from "../../types";
import { Contest } from "../../contests/types";
import { finalContestants } from "@/lib/contestants";

export async function GET(): Promise<NextResponse<Contestant[] | ApiError>> {
  // Get the active contest
  const { data: contest, error: contestError } = await supabase
    .from("contests")
    .select("*")
    .eq("active", true)
    .single();

  if (contestError || !contest?.id) {
    return NextResponse.json({ error: "No active contest" }, { status: 404 });
  }

  // Fetch contestants for that contest
  const { data: contestants, error: contestantError } = await supabase
    .from("contestants")
    .select("*")
    .eq("contest_id", contest.id);

  if (contestantError) {
    return NextResponse.json(
      { error: contestantError.message },
      { status: 500 }
    );
  }
  if (!contestants) {
    return NextResponse.json(
      { error: "No contestants found" },
      { status: 404 }
    );
  }

  return NextResponse.json(finalContestants(contestants as Contestant[], contest as Contest));
}


