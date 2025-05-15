import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

interface Contest {
  id: string;
  description?: string | null;
  active: boolean;
  created_at: string;
}

interface ApiError {
  error: string;
}

export async function GET(): Promise<NextResponse<Contest[] | ApiError>> {
  const { data, error } = await supabase
    .from("contests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "No data returned" }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(
  req: Request
): Promise<NextResponse<Contest | ApiError>> {
  const { id, description } = await req.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: 'Invalid or missing "id"' },
      { status: 400 }
    );
  }

  // 1. Deactivate existing active contests
  const { error: updateError } = await supabase
    .from("contests")
    .update({ active: false })
    .eq("active", true);

  if (updateError) {
    return NextResponse.json(
      {
        error: "Failed to deactivate existing contests: " + updateError.message,
      },
      { status: 500 }
    );
  }

  // 2. Insert new contest as active
  const { data, error } = await supabase
    .from("contests")
    .insert([{ id, description: description ?? null, active: true }])
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json(
      { error: "No data returned from Supabase" },
      { status: 500 }
    );

  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: 'Missing "id"' }, { status: 400 });
  }

  const { error } = await supabase.from("contests").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
