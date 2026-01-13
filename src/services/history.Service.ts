import { db } from "../db/db";
import { eq, and, desc } from "drizzle-orm";
import { watchHistory } from "../db/schema";
import { ApiError } from "../utils/ApiError";

export const upsertWatchHistory = async (userId: string, movieId: string, progress: number, duration?: number) => {
    if (!movieId) {
        throw new ApiError(400, "MovieId is required");
    }

    // 1. Kiểm tra xem đã có lịch sử xem phim này chưa
    const existingRecord = await db.query.watchHistory.findFirst({
        where: and(eq(watchHistory.userId, userId), eq(watchHistory.movieId, movieId)),
    });

    if (existingRecord) {
        // 2a. Nếu có rồi -> Update
        const [updatedRecord] = await db.update(watchHistory)
            .set({ 
                progress, 
                duration, 
                watchedAt: new Date(), 
                updatedAt: new Date() 
            })
            .where(and(eq(watchHistory.userId, userId), eq(watchHistory.movieId, movieId)))
            .returning();

        return updatedRecord;
    } else {
        // 2b. Nếu chưa có -> Insert mới
        const [newRecord] = await db.insert(watchHistory).values({
            userId,
            movieId,
            progress,
            duration,
        }).returning();

        return newRecord;
    }
};

export const getWatchHistory = async (userId: string) => {
    const history = await db.query.watchHistory.findMany({
        where: eq(watchHistory.userId, userId),
        with: { movie: true }, // Join để lấy thông tin phim
        orderBy: (history) => desc(history.watchedAt),
    });
    
    return history;
};

export const deleteWatchHistory = async (userId: string, watchHistoryId: string) => {
    if (!watchHistoryId) {
        throw new ApiError(400, "WatchHistoryId is required");
    }

    // Thực hiện xóa và trả về dòng đã xóa
    const [deletedHistory] = await db.delete(watchHistory)
        .where(and(eq(watchHistory.userId, userId), eq(watchHistory.id, watchHistoryId)))
        .returning();

    // Nếu không có dòng nào được trả về, nghĩa là ID không tồn tại hoặc không thuộc về user này
    if (!deletedHistory) {
        throw new ApiError(404, "Watch history item not found");
    }

    return deletedHistory;
}