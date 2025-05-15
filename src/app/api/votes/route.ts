import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { nickname, ranking } = await req.json();

  if (!nickname || !Array.isArray(ranking)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('id')
    .eq('active', true)
    .single();

  if (contestError || !contest?.id) {
    return NextResponse.json({ error: 'No active contest' }, { status: 404 });
  }

  const { error } = await supabase
    .from('votes')
    .upsert({
      contest_id: contest.id,
      nickname,
      ranking,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get('nickname');
  
    if (!nickname) {
      return NextResponse.json({ error: 'Missing nickname' }, { status: 400 });
    }
  
    const { data: contest } = await supabase
      .from('contests')
      .select('id')
      .eq('active', true)
      .single();
  
    if (!contest?.id) {
      return NextResponse.json({ error: 'No active contest' }, { status: 404 });
    }
  
    const { data, error } = await supabase
      .from('votes')
      .select('ranking')
      .eq('contest_id', contest.id)
      .eq('nickname', nickname)
      .single();
  
    if (error) {
      return NextResponse.json({ error: error.message, nickname }, { status: 404 });
    }
  
    return NextResponse.json(data);
  }
  
