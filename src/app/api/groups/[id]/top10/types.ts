export interface GroupVoteResult {
  contestant_id: string; // UUID
  points: number; // Total points accumulated
  rank: number; // Final rank (1–10)
}
