import { db } from '../db/db';
import { genres, movieGenres, movies } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const getAllGenres = async () => {
    try {
        const allGenres = await db.query.genres.findMany();
        return allGenres;
    } catch (error: any) {
        throw new Error('Lấy danh sách thể loại không thành công: ' + error.message);
    }
}

export const getMoviesByGenreId = async (genreId: string) => {
    try {
        const movies = await db.query.genres.findFirst({
            where: eq(genres.id, genreId),
            with: {
                movieGenres: {
                    with: {
                        movie: true,
                    },
                },
            },
        });
        return movies;
    } catch (error: any) {
        throw new Error('Lấy thông tin thể loại không thành công: ' + error.message);
    }
};

export const addGenre = async (genreData: typeof genres.$inferInsert) => {
    try {
        const existing = await db.query.genres.findFirst({
            where: eq(genres.name, genreData.name),
        });

        if (existing) {
            throw new Error("Thể loại đã tồn tại");
        }

        const newGenre = await db.insert(genres).values({
            name: genreData.name,
            description: genreData.description || null,
        }).returning();

        return newGenre[0];
    } catch (error: any) {
        throw new Error('Thêm thể loại không thành công: ' + error.message);
    }
}

export const updateGenre = async (id: string, genreData: Partial<typeof genres.$inferInsert>) => {
    try {
        const existing = await db.query.genres.findFirst({
            where: eq(genres.id, id),
        });

        if (!existing) {
            throw new Error("Thể loại không tồn tại");
        }

        const updatedGenre = await db.update(genres)
            .set({
                ...(genreData.name ? { name: genreData.name } : {}),
                ...(genreData.description !== undefined ? { description: genreData.description } : {})
            })
            .where(eq(genres.id, id))
            .returning();

        return updatedGenre[0];
    } catch (error: any) {
        throw new Error('Cập nhật thể loại không thành công: ' + error.message);
    }
}

export const deleteGenre = async (id: string) => {
    try {
        const existing = await db.query.genres.findFirst({
            where: eq(genres.id, id),
        });

        if (!existing) {
            throw new Error("Thể loại không tồn tại");
        }

        const linkedMovies = await db.query.movieGenres.findFirst({
            where: eq(movieGenres.genreId, id),
        });

        if (linkedMovies) {
            throw new Error("Không thể xóa: Thể loại này đang được sử dụng trong phim");
        }

        return await db.delete(genres).where(eq(genres.id, id));

    } catch (error: any) {
        throw new Error('Xóa thể loại không thành công: ' + error.message);
    }
}

