export interface Contestant {
  id: string;
  contest_id: string;
  country: string; // ISO 3166-1 alpha-2 code
  performer?: string;
  song?: string;
  image_url?: string;
  is_final?: boolean;
  created_at?: string;
}
