export interface Contest {
  id: string; // e.g. "2025"
  host: string | null; // ISO country code
  description?: string;
  banner_url?: string;
  active: boolean;
  created_at?: string;
}
