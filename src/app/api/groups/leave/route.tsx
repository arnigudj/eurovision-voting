import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  const group_id = searchParams.get('group_id');

  if (!user_id || !group_id) {
    return NextResponse.json({ error: 'Missing user_id or group_id' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_groups')
    .delete()
    .eq('user_id', user_id)
    .eq('group_id', group_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
