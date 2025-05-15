import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contest_id = searchParams.get('contest_id');
  if (!contest_id) return NextResponse.json({ error: 'Missing contest_id' }, { status: 400 });

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
