import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File;
  const nickname = form.get('nickname')?.toString().trim();

  if (!file || !nickname) {
    return NextResponse.json({ error: 'Missing nickname or image' }, { status: 400 });
  }

  const { data: exists } = await supabase
    .from('users')
    .select('id')
    .eq('nickname', nickname)
    .maybeSingle();

  if (exists) {
    return NextResponse.json({ error: 'Nickname already taken' }, { status: 409 });
  }

  const path = `${nickname}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('users')
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('users')
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json({ error: signedUrlError?.message || 'Could not create signed URL' }, { status: 500 });
  }

  const image_url = signedUrlData.signedUrl;

  const { error: insertError } = await supabase
    .from('users')
    .insert({ nickname, image_url });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
