export interface LeaderboardEntry {
  user_id: string;
  nickname: string;
  image_url: string;
  ranking: string[]; // top 10 voted by user
  score: number;
  place: number;
}

export interface UserWithMeta {
  user_id: string;
  users: {
    nickname: string;
    image_url: string;
  };
}
