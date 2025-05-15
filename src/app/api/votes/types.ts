export interface Vote {
  id: string;
  contest_id: string;
  nickname: string;
  ranking: string[]; // array of contestant ids
  updated_at?: string;
}
