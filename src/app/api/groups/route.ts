import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let contest_id = searchParams.get('contest_id');
  if (!contest_id) {
    // get the active contest id
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('id')
      .eq('active', true)
      .single();
    if (contestError || !contest?.id) {
      return NextResponse.json({ error: 'No active contest' }, { status: 404 });
    }
    contest_id = contest.id;
  }

  const { data, error } = await supabase
    .from('groups')
    .select('id, name')
    .eq('contest_id', contest_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { name, contest_id } = await req.json();
  if (!name || !contest_id) {
    return NextResponse.json({ error: 'Missing name or contest_id' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({ name, contest_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
