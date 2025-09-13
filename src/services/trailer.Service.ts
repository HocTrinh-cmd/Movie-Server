import { db } from "../db/db";
import { eq, and } from "drizzle-orm";
import { trailers } from "../db/schema";

export const getTrailerByMovieId = async (movieId: string) => {
    try {
        const trailer = await db.query.trailers.findMany({
            where: eq(trailers.movieId, movieId),
        });
        return trailer;
    } catch (error: any) {
        throw new Error('Lấy trailer không thành công: ' + error.message);
    }
};

export const uploadTrailer = async (data: { movieId: string, title: string, youtubeUrl: string }) => {
    try {
        const newTrailer = await db.insert(trailers).values(data).returning();
        return newTrailer[0];
    } catch (error: any) {
        throw new Error('Thêm trailer không thành công: ' + error.message);
    }
};

export const updateTrailer = async (trailerId: string, data: { title?: string, youtubeUrl?: string }) => {
    try {
        const updatedTrailer = await db.update(trailers).set({
            ...data,
            title: data.title ? data.title : undefined,
            youtubeUrl: data.youtubeUrl ? data.youtubeUrl : undefined,
        }).where(eq(trailers.id, trailerId)).returning();
        return updatedTrailer[0];
    } catch (error: any) {
        throw new Error('Cập nhật trailer không thành công: ' + error.message);
    }
};

export const deleteTrailer = async (trailerId: string) => {
    try {
        const deletedTrailer = await db.delete(trailers).where(eq(trailers.id, trailerId)).returning();
        return deletedTrailer[0];
    } catch (error: any) {
        throw new Error('Xoá trailer không thành công: ' + error.message);
    }
};