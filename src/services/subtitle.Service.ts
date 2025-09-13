import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { subtitles } from "../db/schema";

export const getSubtitlesByMovieId = async (movieId: string) => {
    try {
        const subtitlesList = await db.query.subtitles.findMany({
            where: eq(subtitles.movieId, movieId),
        });
        return subtitlesList;
    } catch (error: any) {
        throw new Error('Lấy phụ đề không thành công: ' + error.message);
    }
};

export const uploadSubtitle = async ( movieId: string, lang: string, label: string, fileUrl: string ) => {
    try {
        const newsubtitle = await db.insert(subtitles).values({
            movieId: movieId,
            lang: lang,
            label: label,
            fileUrl: fileUrl,
        }).returning();
        return newsubtitle[0];
    } catch (error: any) {
        throw new Error('Thêm phụ đề không thành công: ' + error.message);
    }
};

export const updateSubtitle = async (subtitleId: string, data: { lang?: string, label?: string, fileUrl?: string }) => {
    try {
        const updatedSubtitle = await db.update(subtitles).set(data).where(eq(subtitles.id, subtitleId)).returning();
        return updatedSubtitle[0];
    } catch (error: any) {
        throw new Error('Cập nhật phụ đề không thành công: ' + error.message);
    }
}

export const deleteSubtitle = async (subtitleId: string) => {
    try {
        const deletedSubtitle = await db.delete(subtitles).where(eq(subtitles.id, subtitleId)).returning();
        return deletedSubtitle[0];
    } catch (error: any) {
        throw new Error('Xoá phụ đề không thành công: ' + error.message);
    } 
};


