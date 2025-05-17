// app/api/groups/[id]/top10/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const POINTS = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: group_id } = await params;

  // 1. Get contest_id for the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('contest_id')
    .eq('id', group_id)
    .single();

  if (groupError || !group?.contest_id) {
    return NextResponse.json(
      { error: 'Invalid group or missing contest' },
      { status: 400 }
    );
  }

  // 2. Get votes from users in this group
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('user_id, ranking')
    .eq('contest_id', group.contest_id);

  if (votesError || !votes) {
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }

  const { data: userGroups } = await supabase
    .from('user_groups')
    .select('user_id')
    .eq('group_id', group_id);

  const validUserIds = new Set(userGroups?.map((ug) => ug.user_id));

  const scoreMap: Record<string, number> = {};

  for (const vote of votes) {
    if (!validUserIds.has(vote.user_id)) continue;
    if (!Array.isArray(vote.ranking)) continue;

    for (let i = 0; i < Math.min(vote.ranking.length, 10); i++) {
      const contestant_id = vote.ranking[i];
      const points = POINTS[i];
      if (!contestant_id) continue;
      scoreMap[contestant_id] = (scoreMap[contestant_id] || 0) + points;
    }
  }

  const sorted = Object.entries(scoreMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([contestant_id, points], index) => ({
      contestant_id,
      points,
      rank: index + 1,
    }));

  return NextResponse.json(sorted);
}
