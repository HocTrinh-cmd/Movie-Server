import { db } from "../db/db";
import { eq, and, desc } from "drizzle-orm";
import { watchHistory } from "../db/schema";

export const upsertWatchHistory = async (userId: string, movieId: string, progress: number, duration?: number) => {
    try {
        const existingRecord = await db.query.watchHistory.findFirst({
            where: and(eq(watchHistory.userId, userId), (eq(watchHistory.movieId, movieId))),
        });
        if (existingRecord) {
            const updatedRecord = await db.update(watchHistory)
                .set({ progress, duration, watchedAt: new Date(), updatedAt: new Date() })
                .where(and(eq(watchHistory.userId, userId), (eq(watchHistory.movieId, movieId))))
                .returning();

            return updatedRecord[0];
        } else {
            const newRecord = await db.insert(watchHistory).values({
                userId,
                movieId,
                progress,
                duration,
            }).returning();

            return newRecord[0];
        }
    } catch (error: any) {
        throw new Error('Cập nhật lịch sử xem không thành công: ' + error.message);
    }
};

export const getWatchHistory = async (userId: string) => {
    try {
        const history = await db.query.watchHistory.findMany({
            where: eq(watchHistory.userId, userId),
            with: { movie: true },
            orderBy: (history) => desc(history.watchedAt),
        });
        return history;
    } catch (error: any) {
        throw new Error('Lấy lịch sử xem không thành công: ' + error.message);
    }   
};

export const deleteWatchHistory = async (userId: string, watchHistoryId: string) => {
    try {
        const deleteHistory = await db.delete(watchHistory).where(and(eq(watchHistory.userId, userId), eq(watchHistory.id, watchHistoryId)));
        return deleteHistory;
    } catch (error: any) {
        throw new Error('Xoá lịch sử xem không thành công: ' + error.message);
    }
}