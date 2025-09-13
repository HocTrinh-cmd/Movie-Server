import { db } from '../db/db';
import { movieCasts, movieGenres, movies, movieKeywords, genres, casts, keywords } from '../db/schema';
import { eq, inArray, desc, sql } from 'drizzle-orm';


type AddMovieInput = {
  title: string;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate?: string;
  runtime?: number;
  isAdult?: boolean;
  originalTitle?: string;
  originalLanguage?: string;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  status?: string;
  genreIds?: string[];
  castIds?: string[];
};

export const getMovies = async ({ page = 1, perPage = 20 }: { page?: number; perPage?: number }) => {
  try {
    const movies = await db.query.movies.findMany({
      limit: perPage,
      offset: (page - 1) * perPage,
      orderBy: (m) => desc(m.releaseDate),
    });
    return { page, perPage, results: movies };
  } catch (error: any) {
    throw new Error('Lấy danh sách phim không thành công: ' + error.message);
  }
};

export const discoverMovies = async ({
  genres,
  match,
  page,
  perPage,
}: {
  genres: string[];
  match: "any" | "all";
  page: number;
  perPage: number;
}) => {
  
  if (genres.length === 0) {
    return getMovies({ page, perPage });
  }

  if (match === "all") {
    const data = await db
      .select({ movie: movies })
      .from(movies)
      .innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .where(inArray(movieGenres.genreId, genres))
      .groupBy(movies.id)
      .having(sql`COUNT(DISTINCT ${movieGenres.genreId}) = ${genres.length}`)
      .limit(perPage)
      .offset((page - 1) * perPage);

    return { page, perPage, results: data };
  }

  const data = await db.query.movies.findMany({
    where: (m, { inArray }) => inArray(movieGenres.genreId, genres),
    limit: perPage,
    offset: (page - 1) * perPage,
    orderBy: (m) => desc(m.releaseDate),
    with: {
      movieGenres: { with: { genre: true } },
    },
  });

  return { page, perPage, results: data };
};


export const getMovieDetailById = async (id: string) => {
  try {
    const movie = await db.query.movies.findFirst({
      where: (m, { eq }) => eq(m.id, id),
      with: {
        movieCasts: { with: { cast: true } },
        movieGenres: { with: { genre: true } },
        movieKeywords: true,
        comments: { with: { user: true , replies: true } },
      },
    });

    if (!movie) throw new Error('Không tìm thấy phim');
    return movie;
  } catch (error: any) {
    throw new Error('Lấy thông tin phim không thành công: ' + error.message);
  }
};

export const searchMovies = async (query: string) => {
  try {
    const movies = await db.query.movies.findMany({
      where: (m, { ilike }) => ilike(m.title, `%${query}%`),
    });

    return movies;
  } catch (error: any) {
    throw new Error('Tìm kiếm phim không thành công: ' + error.message);
  }
};

export const addMovie = async (data: AddMovieInput) => {
  const [newMovie] = await db.insert(movies).values({
    title: data.title,
    overview: data.overview,
    posterUrl: data.posterUrl,
    backdropUrl: data.backdropUrl,
    releaseDate: data.releaseDate,
    runtime: data.runtime,
    isAdult: data.isAdult,
    originalTitle: data.originalTitle,
    originalLanguage: data.originalLanguage,
    voteAverage: data.voteAverage,
    voteCount: data.voteCount,
    popularity: data.popularity,
    status: data.status,
  }).returning();

  // Thêm genres
  if (data.genreIds?.length) {
    await db.insert(movieGenres).values(
      data.genreIds.map((genreId) => ({
        movieId: newMovie.id,
        genreId,
      }))
    );
  }

  // Thêm cast
  if (data.castIds?.length) {
    await db.insert(movieCasts).values(
      data.castIds.map((castId) => ({
        movieId: newMovie.id,
        castId,
      }))
    );
  }

  return newMovie;
};


export const updateMovie = async (
  id: string,
  movieData: Partial<typeof movies.$inferInsert> & {
    genreIds?: string[];
    castIds?: string[];
  }
) => {
  try {
    return await db.transaction(async (transaction) => {
      const result = await transaction
        .update(movies)
        .set({
          ...movieData,
        })
        .where(eq(movies.id, id))
        .returning();

      if (result.length === 0) throw new Error("Không tìm thấy phim để cập nhật");

      if (movieData.genreIds) {
        await transaction.delete(movieGenres).where(eq(movieGenres.movieId, id));
        if (movieData.genreIds.length > 0) {
          await transaction.insert(movieGenres).values(
            movieData.genreIds.map((genreIds) => ({
              movieId: id,
              genreId: genreIds,
            }))
          );
        }
      }

      if (movieData.castIds) {
        await transaction.delete(movieCasts).where(eq(movieCasts.movieId, id));
        if (movieData.castIds.length > 0) {
          await transaction.insert(movieCasts).values(
            movieData.castIds.map((castIds) => ({
              movieId: id,
              castId: castIds,
            }))
          );
        }
      }

      return result[0];
    });
  } catch (error: any) {
    throw new Error("Cập nhật phim không thành công: " + error.message);
  }
};

export const deleteMovie = async (id: string) => {
  try {
    const result = await db.delete(movies).where(eq(movies.id, id)).returning();
    if (result.length === 0) throw new Error('Không tìm thấy phim để xóa');
    return result[0];
  } catch (error: any) {
    throw new Error('Xóa phim không thành công: ' + error.message);
  }
};

