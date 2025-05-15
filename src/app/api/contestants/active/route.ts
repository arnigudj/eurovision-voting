import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  // Get the active contest
  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('id')
    .eq('active', true)
    .single();

  if (contestError || !contest?.id) {
    return NextResponse.json({ error: 'No active contest' }, { status: 404 });
  }

  // Fetch contestants for that contest
  const { data: contestants, error: contestantError } = await supabase
    .from('contestants')
    .select('id, country')
    .eq('contest_id', contest.id);

  if (contestantError) {
    return NextResponse.json({ error: contestantError.message }, { status: 500 });
  }

  return NextResponse.json(contestants);
}
