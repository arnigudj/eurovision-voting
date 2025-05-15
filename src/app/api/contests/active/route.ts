import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .eq('active', true)
      .single();
  
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'No active contest' },
        { status: 404 }
      );
    }
  
    return NextResponse.json(data);
  }
  
  

export async function PATCH(req: Request) {
  const { id } = await req.json();

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing "id"' }, { status: 400 });
  }

  const { error: deactivateError } = await supabase
    .from('contests')
    .update({ active: false })
    .eq('active', true);

  if (deactivateError) {
    return NextResponse.json({ error: 'Failed to deactivate others' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('contests')
    .update({ active: true })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Activation failed' }, { status: 500 });
  }

  return NextResponse.json(data);
}
