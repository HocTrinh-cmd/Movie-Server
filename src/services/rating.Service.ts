import { db } from "../db/db";
import { eq, sql } from "drizzle-orm";
import { ratings, movies } from "../db/schema";

type MovieRating = {
    voteAverage?: number | null;
    voteCount?: number | null;
    tmdbvoteAverage?: number | null;
    tmdbvoteCount?: number | null;
};

function calculateCombinedAverage(m: MovieRating): number {
    const voteCount = m.voteCount ?? 0;
    const tmdbvoteCount = m.tmdbvoteCount ?? 0;
    const voteAverage = m.voteAverage ?? 0;
    const tmdbvoteAverage = m.tmdbvoteAverage ?? 0;

    const totalVotes = voteCount + tmdbvoteCount;
    if (totalVotes === 0) return 0;

    const avg = ((voteAverage * voteCount) + (tmdbvoteAverage * tmdbvoteCount)) / totalVotes;
    return Math.round(avg * 10) / 10;
}

export const getRatingsByMovieId = async (movieId: string) => {
    try {
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
            }
        });

        return ratingsList.map(r => ({
            ...r,
            combinedAverage: calculateCombinedAverage(r.movie)
        }));
    } catch (error: any) {
        throw new Error('Lấy đánh giá không thành công: ' + error.message);
    }
};

export const addOrUpdateRating = async (userId: string, movieId: string, score: number) => {
    try {
        const existingRating = await db.query.ratings.findFirst({
            where: eq(ratings.userId, userId),
        });

        if (existingRating) {
            await db.update(ratings).set({ score }).where(eq(ratings.id, existingRating.id)).returning();
        } else {
            await db.insert(ratings).values({
                userId,
                movieId,
                score
            }).returning();
        }

        const result = await db
            .select({
                avg: sql<number>`avg(${ratings.score})`,
                total: sql<number>`count(${ratings.id})`,
            })
            .from(ratings)
            .where(eq(ratings.movieId, movieId));

        const avg = result[0]?.avg ?? 0;
        const total = result[0]?.total ?? 0;

        await db.update(movies)
            .set({
                voteAverage: avg,
                voteCount: total,
            })
            .where(eq(movies.id, movieId));
        return result;

    } catch (error: any) {
        throw new Error('Thêm hoặc cập nhật đánh giá không thành công: ' + error.message);
    }
};
