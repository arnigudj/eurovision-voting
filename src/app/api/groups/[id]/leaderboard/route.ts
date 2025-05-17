import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { LeaderboardEntry, UserWithMeta } from "./types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: group_id } = await params;

  // 1. Get the contest_id from the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("contest_id")
    .eq("id", group_id)
    .single();

  if (groupError || !group?.contest_id) {
    return NextResponse.json(
      { error: "Invalid group or missing contest" },
      { status: 400 }
    );
  }

  // get the contestants
  const { data: contestants, error: contestantsError } = await supabase
    .from("contestants")
    .select("id, country")
    .eq("contest_id", group.contest_id);

  if (contestantsError || !contestants) {
    return NextResponse.json(
      { error: "Failed to fetch contestants" },
      { status: 500 }
    );
  }

  const idToCountry = new Map<string, string>();
  for (const c of contestants) {
    idToCountry.set(c.id, c.country);
  }

  // 2. Get the official top 10
  const { data: rankData, error: rankError } = await supabase
    .from("rank")
    .select("ranking")
    .eq("contest_id", group.contest_id)
    .single();

  if (rankError || !rankData?.ranking || rankData.ranking.length === 0) {
    return NextResponse.json(
      { error: "No official ranking set for this contest" },
      { status: 400 }
    );
  }

  // 3. Get all users in this group
  const { data: usersData, error: usersError } = await supabase
    .from("user_groups")
    .select("user_id, users(nickname, image_url)")
    .eq("group_id", group_id);

  if (usersError || !usersData || usersData.length === 0) {
    return NextResponse.json([], { status: 200 }); // no users
  }

  const userIds: string[] = usersData.map((u) => u.user_id);

  // 4. Get votes for these users in this contest
  const { data: votesData, error: votesError } = await supabase
    .from("votes")
    .select("user_id, ranking")
    .eq("contest_id", group.contest_id)
    .in("user_id", userIds);

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 });
  }

  // 5. Map user_id to vote
  const voteMap = new Map<string, string[]>();
  for (const vote of votesData || []) {
    voteMap.set(vote.user_id, vote.ranking);
  }

  // 6. Compute scores
  const numUsers = usersData.length;
  const users = usersData as unknown as UserWithMeta[];
  const leaderboard: LeaderboardEntry[] = users
    .map((u) => {
      const ranking = voteMap.get(u.user_id) || [];
      if (ranking.length === 0) return null;
      let score = 0;

      for (const votedId of ranking) {
        const officialIndex = rankData.ranking.indexOf(votedId);

        if (officialIndex === -1) continue;

        if (officialIndex === 0) score += 5;
        else if (officialIndex <= 2) score += 3;
        else if (officialIndex <= 4) score += 2;
        else if (officialIndex <= 9) score += 1;
      }

      return {
        user_id: u.user_id,
        nickname: u.users.nickname,
        image_url: u.users.image_url,
        ranking: ranking.map((id) => idToCountry.get(id) || id),
        score,
        place: numUsers,
      };
    })
    .filter((entry): entry is LeaderboardEntry => entry !== null);

  // 7. Sort by score descending, then nickname
  leaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.nickname.localeCompare(b.nickname);
  });

  // 8. Add place
  let lastScore: number | undefined;
  let currentPlace = 1;

  for (let i = 0; i < leaderboard.length; i++) {
    const entry: Partial<LeaderboardEntry> = leaderboard[i];

    if (entry.score !== lastScore) {
      currentPlace = i + 1;
    }

    entry.place = currentPlace;
    lastScore = entry.score;
  }

  return NextResponse.json(leaderboard);
}
