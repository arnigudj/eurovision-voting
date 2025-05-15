export interface Rank {
  contest_id: string;
  ranking: string[]; // array of contestant ids
  updated_at?: string;
}
