import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { subtitles } from "../db/schema";
import { ApiError } from "../utils/ApiError";
import { uploadFileToFirebase, deleteFileFromFirebase } from "./firebase.Service";
import 'multer';

export const getSubtitlesByMovieId = async (movieId: string) => {
    if (!movieId) throw new ApiError(400, "Movie ID is required");

    const subtitlesList = await db.query.subtitles.findMany({
        where: eq(subtitles.movieId, movieId),
    });

    return subtitlesList;
};

export const uploadSubtitle = async (movieId: string, lang: string, label: string, file: Express.Multer.File) => {
    if (!movieId) throw new ApiError(400, "Movie ID is required");
    if (!file) throw new ApiError(400, "Subtitle file is required");
    if (!lang) throw new ApiError(400, "Language code is required");

    // 1. Upload file lên Firebase Storage
    // Hàm này sẽ trả về Signed URL (hoặc Public URL tùy config của bạn)
    const fileUrl = await uploadFileToFirebase(
        file.buffer,
        'subtitles', // Tên folder trên Firebase
        file.originalname,
        'text/vtt' // Định dạng phụ đề (hoặc dùng file.mimetype)
    );

    // 2. Lưu thông tin và URL vào Database
    const [newSubtitle] = await db.insert(subtitles).values({
        movieId,
        lang,
        label: label || lang, // Default lấy lang làm label nếu thiếu
        fileUrl: fileUrl,     // URL từ Firebase
    }).returning();

    return newSubtitle;
};

export const updateSubtitle = async (subtitleId: string, data: { lang?: string, label?: string }) => {
    if (!subtitleId) throw new ApiError(400, "Subtitle ID is required");

    const [updatedSubtitle] = await db.update(subtitles)
        .set(data)
        .where(eq(subtitles.id, subtitleId))
        .returning();

    if (!updatedSubtitle) {
        throw new ApiError(404, "Subtitle not found to update");
    }

    return updatedSubtitle;
};

export const deleteSubtitle = async (subtitleId: string) => {
    if (!subtitleId) throw new ApiError(400, "Subtitle ID is required");

    // 1. Tìm subtitle trong DB để lấy fileUrl cũ
    const subtitle = await db.query.subtitles.findFirst({
        where: eq(subtitles.id, subtitleId)
    });

    if (!subtitle) {
        throw new ApiError(404, "Subtitle not found to delete");
    }

    // 2. Nếu có fileUrl, tiến hành xóa file trên Firebase để dọn rác
    if (subtitle.fileUrl) {
        await deleteFileFromFirebase(subtitle.fileUrl);
    }

    // 3. Xóa record trong Database
    const [deletedSubtitle] = await db.delete(subtitles)
        .where(eq(subtitles.id, subtitleId))
        .returning();

    return deletedSubtitle;
};