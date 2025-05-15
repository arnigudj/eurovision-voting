import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contest_id = searchParams.get('contest_id');

  if (!contest_id) {
    return NextResponse.json({ error: 'Missing contest_id parameter' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('contestants')
    .select('*')
    .eq('contest_id', contest_id)
    .order('country');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { contest_id, country, performer, song, image_url, is_final } = body;
  
    if (!contest_id || !country) {
      return new Response(JSON.stringify({ error: 'Missing contest_id or country' }), { status: 400 });
    }
  
    const { data, error } = await supabase
      .from('contestants')
      .insert([{ contest_id, country, performer, song, image_url, is_final }])
      .select()
      .single();
  
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  
    return new Response(JSON.stringify(data), { status: 200 });
  }
