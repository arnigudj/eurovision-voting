import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { Contest } from "../types";
import { ApiError } from "../../types";

export async function GET(_: Request, { params }: { params: { id: string } }): Promise<NextResponse<Contest | ApiError>> {
  const { id } = params;

  const { data, error } = await supabase
    .from("contests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<Contest | ApiError>> {
  const { id } = params;
  const body = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing contest ID" }, { status: 400 });
  }

  const allowedFields = ["host", "description", "banner_url"];
  const updateData: Record<string, string> = {};

  for (const key of allowedFields) {
    if (body[key] !== undefined) updateData[key] = body[key];
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contests")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
