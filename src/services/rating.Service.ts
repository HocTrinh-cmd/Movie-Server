import { db } from "../db/db";
import { eq, sql, and } from "drizzle-orm"; // Nhớ import 'and'
import { ratings, movies } from "../db/schema";
import { ApiError } from "../utils/ApiError";
import { addPoints } from "./auth.Service"; 
import { POINT_REWARDS } from "../constants/rank";

type MovieRating = {
    voteAverage?: number | null;
    voteCount?: number | null;
    tmdbvoteAverage?: number | null;
    tmdbvoteCount?: number | null;
};

// Helper: Tính điểm trung bình kết hợp (Local + TMDB)
function calculateCombinedAverage(m: MovieRating): number {
    const voteCount = Number(m.voteCount ?? 0);
    const tmdbvoteCount = Number(m.tmdbvoteCount ?? 0);
    const voteAverage = Number(m.voteAverage ?? 0);
    const tmdbvoteAverage = Number(m.tmdbvoteAverage ?? 0);

    const totalVotes = voteCount + tmdbvoteCount;
    if (totalVotes === 0) return 0;

    const avg = ((voteAverage * voteCount) + (tmdbvoteAverage * tmdbvoteCount)) / totalVotes;
    
    // Làm tròn 1 chữ số thập phân
    return Math.round(avg * 10) / 10;
}

export const getRatingsByMovieId = async (movieId: string) => {
    if (!movieId) throw new ApiError(400, "Movie ID is required");

    const ratingsList = await db.query.ratings.findMany({
        where: eq(ratings.movieId, movieId),
        with: {
            movie: {
                columns: {
                    voteAverage: true,
                    voteCount: true,
                    tmdbvoteAverage: true,
                    tmdbvoteCount: true
                }
            },
            user: { // (Optional) Nên lấy thêm thông tin user để hiển thị ai đánh giá
                columns: {
                    id: true,
                    name: true,
                    avatarUrl: true
                }
            }
        }
    });

    return ratingsList.map(r => ({
        ...r,
        combinedvoteCount: (r.movie.voteCount || 0) + (r.movie.tmdbvoteCount || 0),
        combinedAverage: calculateCombinedAverage(r.movie)
    }));
};

export const addOrUpdateRating = async (userId: string, movieId: string, score: number) => {
    if (!movieId) throw new ApiError(400, "Movie ID is required");
    if (score === undefined || score < 0 || score > 10) {
        throw new ApiError(400, "Score must be between 0 and 10");
    }

    // Phải tìm rating dựa trên cả UserId VÀ MovieId
    const existingRating = await db.query.ratings.findFirst({
        where: and(eq(ratings.userId, userId), eq(ratings.movieId, movieId)),
    });

    // Insert hoặc Update
    if (existingRating) {
        await db.update(ratings)
            .set({ score, updatedAt: new Date() })
            .where(eq(ratings.id, existingRating.id));
    } else {
        await db.insert(ratings).values({
            userId,
            movieId,
            score
        });

        addPoints(userId, POINT_REWARDS.RATE_MOVIE).catch(err => 
            console.error(`[Reward] Failed to add rating points for user ${userId}:`, err)
        );
    }

    // Tính toán lại trung bình cộng (Aggregation)
    const result = await db
        .select({
            avg: sql<string>`avg(${ratings.score})`, // Postgres thường trả về string cho avg
            total: sql<number>`count(${ratings.id})`,
        })
        .from(ratings)
        .where(eq(ratings.movieId, movieId));

    // Ép kiểu an toàn
    const newAvg = parseFloat(result[0]?.avg || '0');
    const newTotal = Number(result[0]?.total || 0);
    const roundedAvg = Math.round(newAvg * 10) / 10; // Làm tròn 1 số lẻ

    // 4. Cập nhật cache vào bảng Movies
    await db.update(movies)
        .set({
            voteAverage: roundedAvg,
            voteCount: newTotal,
        })
        .where(eq(movies.id, movieId));
        
    return { 
        message: "Rating submitted successfully",
        newAverage: roundedAvg,
        totalVotes: newTotal 
    };
};