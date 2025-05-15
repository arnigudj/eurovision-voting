import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { Contestant } from "../types";
import { ApiError } from "../../types";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) : Promise<NextResponse<Contestant | ApiError>>{
  const id = params.id;
  const body = await req.json();
  const { performer, song, is_final, image_url } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Missing contestant id" },
      { status: 400 }
    );
  }

  type UpdatePayload = {
    performer?: string;
    song?: string;
    is_final?: boolean;
    image_url?: string;
  };

  const updateData: UpdatePayload = {};
  if (typeof performer === "string") updateData.performer = performer;
  if (typeof song === "string") updateData.song = song;
  if (typeof is_final === "boolean") updateData.is_final = is_final;
  if (typeof image_url === "string") updateData.image_url = image_url;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contestants")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
