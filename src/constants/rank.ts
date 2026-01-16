// src/constants/rank.ts

export const RANKS = {
    BRONZE: "Bronze",
    SILVER: "Silver",
    GOLD: "Gold",
    DIAMOND: "Diamond",
} as const;

// Mốc điểm để lên hạng
export const RANK_THRESHOLDS = {
    [RANKS.BRONZE]: 0,
    [RANKS.SILVER]: 100,
    [RANKS.GOLD]: 500,
    [RANKS.DIAMOND]: 1000,
};

// Điểm thưởng cho từng hành động
export const POINT_REWARDS = {
    COMMENT: 5,       // Comment được 5 điểm
    RATE_MOVIE: 10,   // Đánh giá được 10 điểm
    WATCH_MOVIE: 2,   // Xem phim được 2 điểm
    LOGIN_DAILY: 1,   // (Dành cho sau này)
};