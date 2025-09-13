import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { favorites } from "../db/schema/favorites";

export const getFavoriteMovie = async (userId: string) => {
    try {
        const favoriteMovie = await db.query.favorites.findMany({
            where: eq(favorites.userId, userId),
            with: {
                movie: true,
            },
        });

        return favoriteMovie;
    } catch (error: any) {
        throw new Error('Lấy danh sách phim yêu thích không thành công: ' + error.message);
    }
}

export const isFavorite = async (userId: string, movieId: string) => {
    try {
        const favorite = await db.query.favorites.findFirst({
            where: and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)),
        });

        return !!favorite;
    } catch (error: any) {
        throw new Error('Kiểm tra phim yêu thích không thành công: ' + error.message);
    }
};

const addFavoriteMovie = async (userId: string, movieId: string) => {
  await db.insert(favorites).values({ userId, movieId });
};

const removeFavoriteMovie = async (userId: string, movieId: string) => {
  await db.delete(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.movieId, movieId))
  );
};

export const toggleFavoriteMovie = async (userId: string, movieId: string) => {
  const exist = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)),
  });

  if (exist) {
    await removeFavoriteMovie(userId, movieId);
    return { status: "removed" };
  } else {
    await addFavoriteMovie(userId, movieId);
    return { status: "added" };
  }
};