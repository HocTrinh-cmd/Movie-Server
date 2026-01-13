import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { trailers } from "../db/schema";
import { ApiError } from "../utils/ApiError";

export const getTrailerByMovieId = async (movieId: string) => {
    if (!movieId) throw new ApiError(400, "Movie ID is required");

    const trailerList = await db.query.trailers.findMany({
        where: eq(trailers.movieId, movieId),
    });
    
    return trailerList;
};

export const uploadTrailer = async (data: { movieId: string, title: string, youtubeUrl: string }) => {
    // Validate inputs
    if (!data.movieId) throw new ApiError(400, "Movie ID is required");
    if (!data.title || !data.youtubeUrl) throw new ApiError(400, "Title and YouTube URL are required");

    const [newTrailer] = await db.insert(trailers).values(data).returning();
    
    return newTrailer;
};

export const updateTrailer = async (trailerId: string, data: { title?: string, youtubeUrl?: string }) => {
    if (!trailerId) throw new ApiError(400, "Trailer ID is required");

    // Drizzle tự động bỏ qua các field undefined khi update, 
    // nhưng ta vẫn nên đảm bảo data object không rỗng nếu cần thiết.
    
    const [updatedTrailer] = await db.update(trailers)
        .set(data)
        .where(eq(trailers.id, trailerId))
        .returning();

    if (!updatedTrailer) {
        throw new ApiError(404, "Trailer not found to update");
    }

    return updatedTrailer;
};

export const deleteTrailer = async (trailerId: string) => {
    if (!trailerId) throw new ApiError(400, "Trailer ID is required");

    const [deletedTrailer] = await db.delete(trailers)
        .where(eq(trailers.id, trailerId))
        .returning();

    if (!deletedTrailer) {
        throw new ApiError(404, "Trailer not found to delete");
    }
    
    return deletedTrailer;
};