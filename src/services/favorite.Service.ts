import { eq, and, count } from "drizzle-orm";
import { db } from "../db/db";
import { favorites, movies } from "../db/schema";
import { ApiError } from "../utils/ApiError";

// Helper Functions
const addFavoriteMovie = async (userId: string, movieId: string) => {
  const movieExists = await db.query.movies.findFirst({
    where: eq(movies.id, movieId)
  });

  if (!movieExists) {
    throw new ApiError(404, "Movie not found");
  }

  await db.insert(favorites).values({ userId, movieId });
};

const removeFavoriteMovie = async (userId: string, movieId: string) => {
  const movieExists = await db.query.movies.findFirst({
    where: eq(movies.id, movieId)
  });

  if (!movieExists) {
    throw new ApiError(404, "Movie not found");
  }

  await db.delete(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.movieId, movieId))
  );
};

export const getFavoriteMovies = async (userId: string, { page = 1, perPage = 20 }) => {
  const limit = perPage;
  const offset = (page - 1) * limit;

  // Lấy danh sách records
  const records = await db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    limit: limit,
    offset: offset,
    with: {
      movie: true, // Join để lấy thông tin phim
    },
  });

  // Đếm tổng số lượng (để phân trang)
  const totalResult = await db
    .select({ value: count() })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  const totalRecords = totalResult[0].value;

  return { records, totalRecords, page, perPage };
};

export const isFavorite = async (userId: string, movieId: string) => {
  if (!movieId) throw new ApiError(400, "MovieId is required");

  const movieExists = await db.query.movies.findFirst({
    where: eq(movies.id, movieId)
  });

  if (!movieExists) {
    throw new ApiError(404, "Movie not found");
  }

  const favorite = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)),
  });

  return !!favorite;
};

export const toggleFavoriteMovie = async (userId: string, movieId: string) => {
  if (!movieId) throw new ApiError(400, "MovieId is required");

  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)),
  });

  if (existing) {
    await removeFavoriteMovie(userId, movieId);
    return { status: "removed", message: "Removed from favorites" };
  } else {
    await addFavoriteMovie(userId, movieId);
    return { status: "added", message: "Added to favorites" };
  }
};