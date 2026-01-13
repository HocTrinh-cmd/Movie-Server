import { db } from '../db/db';
import { genres, movieGenres } from '../db/schema';
import { eq } from 'drizzle-orm';
import { ApiError } from '../utils/ApiError';

export const getAllGenres = async () => {
    const allGenres = await db.query.genres.findMany();
    return allGenres;
}

export const getMoviesByGenreId = async (genreId: string) => {
    if (!genreId) throw new ApiError(400, "Genre ID is required");

    const genreWithMovies = await db.query.genres.findFirst({
        where: eq(genres.id, genreId),
        with: {
            movieGenres: {
                with: {
                    movie: true,
                },
            },
        },
    });

    if (!genreWithMovies) {
        throw new ApiError(404, "Genre not found");
    }

    return genreWithMovies;
};

export const addGenre = async (genreData: typeof genres.$inferInsert) => {
    if (!genreData.name) throw new ApiError(400, "Genre name is required");

    // 1. Check trùng tên
    const existing = await db.query.genres.findFirst({
        where: eq(genres.name, genreData.name),
    });

    if (existing) {
        throw new ApiError(409, "Genre already exists");
    }

    // 2. Tạo mới
    const [newGenre] = await db.insert(genres).values({
        name: genreData.name,
        description: genreData.description || null,
    }).returning();

    return newGenre;
}

export const updateGenre = async (id: string, genreData: Partial<typeof genres.$inferInsert>) => {
    if (!id) throw new ApiError(400, "Genre ID is required");

    // Tối ưu: Update trực tiếp và kiểm tra kết quả trả về
    const [updatedGenre] = await db.update(genres)
        .set({
            ...(genreData.name ? { name: genreData.name } : {}),
            ...(genreData.description !== undefined ? { description: genreData.description } : {})
        })
        .where(eq(genres.id, id))
        .returning();

    if (!updatedGenre) {
        throw new ApiError(404, "Genre not found to update");
    }

    return updatedGenre;
}

export const deleteGenre = async (id: string) => {
    if (!id) throw new ApiError(400, "Genre ID is required");

    // 1. Kiểm tra xem thể loại này có phim nào đang dùng không (Ràng buộc khóa ngoại)
    const linkedMovies = await db.query.movieGenres.findFirst({
        where: eq(movieGenres.genreId, id),
    });

    if (linkedMovies) {
        throw new ApiError(400, "Cannot delete genre. It is being used by existing movies.");
    }

    // 2. Xóa
    const [deletedGenre] = await db.delete(genres)
        .where(eq(genres.id, id))
        .returning();

    if (!deletedGenre) {
        throw new ApiError(404, "Genre not found to delete");
    }

    return deletedGenre;
}