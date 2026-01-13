import { db } from '../db/db';
import { movies, movieKeywords, keywords } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';
import { ApiError } from '../utils/ApiError';

/**
 * Get keywords by movie title
 */
export const getKeywordsByMovieTitle = async (title: string) => {
  if (!title) {
    throw new ApiError(400, "Movie title is required");
  }

  const result = await db
    .select({ id: keywords.id, name: keywords.name })
    .from(movieKeywords)
    .innerJoin(movies, eq(movieKeywords.movieId, movies.id))
    .innerJoin(keywords, eq(movieKeywords.keywordId, keywords.id))
    .where(ilike(movies.title, `%${title}%`));

  return result;
};

/**
 * Get movies by keyword
 */
export const getMoviesByKeyword = async (keyword: string) => {
  if (!keyword) {
    throw new ApiError(400, "Keyword is required");
  }

  const result = await db
    .select({
      id: movies.id,
      title: movies.title,
      releaseDate: movies.releaseDate,
    })
    .from(movies)
    .leftJoin(movieKeywords, eq(movies.id, movieKeywords.movieId))
    .leftJoin(keywords, eq(movieKeywords.keywordId, keywords.id))
    .where(ilike(keywords.name, `%${keyword}%`));

  return result;
};

/**
 * Save movie with keywords (Transaction)
 */
export const saveMovieWithKeywords = async (
  movieData: { id?: string; title: string; releaseDate: string },
  keywordNames: string[]
) => {
  if (!movieData.title) throw new ApiError(400, "Movie title is required");
  
  return await db.transaction(async (tx) => {
    // 1. Insert movie (nếu chưa có)
    let movieId: string;

    const validReleaseDate = movieData.releaseDate || null; 

    if (movieData.id) {
      movieId = movieData.id;
      await tx.insert(movies)
        .values({
          id: movieId,
          title: movieData.title,
          releaseDate: validReleaseDate, // Truyền String hoặc Null
        })
        .onConflictDoNothing();
    } else {
      const [movie] = await tx.insert(movies)
        .values({
          title: movieData.title,
          releaseDate: validReleaseDate, // Truyền String hoặc Null
        })
        .returning({ id: movies.id });
      movieId = movie.id;
    }

    // 2. Lưu từng keyword
    if (keywordNames && keywordNames.length > 0) {
      for (const name of keywordNames) {
        let keywordId: string;

        // Kiểm tra keyword tồn tại chưa
        const [existingKeyword] = await tx
          .select()
          .from(keywords)
          .where(eq(keywords.name, name));

        if (existingKeyword) {
          keywordId = existingKeyword.id;
        } else {
          // Nếu chưa có thì tạo mới
          const [insertedKeyword] = await tx.insert(keywords)
            .values({ name })
            .returning({ id: keywords.id });
          keywordId = insertedKeyword.id;
        }

        // 3. Liên kết phim - keyword
        await tx.insert(movieKeywords)
          .values({ movieId, keywordId })
          .onConflictDoNothing();
      }
    }

    return { 
      movieId, 
      keywordNames, 
      message: "Movie and keywords saved successfully" 
    };
  });
};