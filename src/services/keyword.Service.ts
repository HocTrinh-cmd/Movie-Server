import { db } from '../db/db';
import { movies, movieKeywords, keywords } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';

/**
 * Lấy movie theo keyword
 */
export const getKeywordsByMovieTitle = async (title: string) => {
  try {
    const result = await db
      .select({ id: keywords.id, name: keywords.name })
      .from(movieKeywords)
      .innerJoin(movies, eq(movieKeywords.movieId, movies.id))
      .innerJoin(keywords, eq(movieKeywords.keywordId, keywords.id))
      .where(ilike(movies.title, `%${title}%`));

    const keywordsList = result.map(r => ({ id: r.id, name: r.name }));

    return keywordsList;
  } catch (error: any) {
    throw new Error("Lấy keywords theo tên phim không thành công: " + error.message);
  }
};

export const getMoviesByKeyword = async (keyword: string) => {
  try {
    const result = await db
      .select()
      .from(movies)
      .leftJoin(movieKeywords, eq(movies.id, movieKeywords.movieId))
      .leftJoin(keywords, eq(movieKeywords.keywordId, keywords.id))
      .where(ilike(keywords.name, `%${keyword}%`));

    return result;
  } catch (error: any) {
    throw new Error("Lấy phim theo keyword không thành công: " + error.message);
  }
};


// Lưu phim + keywords
export const saveMovieWithKeywords = async (
  movieData: { id?: string; title: string; releaseDate: string },
  keywordNames: string[]
) => {
  return await db.transaction(async (tx) => {
    // 1. Insert movie (nếu chưa có)
    let movieId: string;

    if (movieData.id) {
      movieId = movieData.id;
      await tx.insert(movies)
        .values({
          id: movieId,
          title: movieData.title,
          releaseDate: movieData.releaseDate,
        })
        .onConflictDoNothing();
    } else {
      const [movie] = await tx.insert(movies)
        .values({
          title: movieData.title,
          releaseDate: movieData.releaseDate,
        })
        .returning({ id: movies.id }); // lấy id mới sinh
      movieId = movie.id;
    }

    // 2. Lưu từng keyword
    for (const name of keywordNames) {
      // kiểm tra keyword
      let keywordId: string;

      const [existingKeyword] = await tx
        .select()
        .from(keywords)
        .where(eq(keywords.name, name));

      if (existingKeyword) {
        keywordId = existingKeyword.id;
      } else {
        const [insertedKeyword] = await tx.insert(keywords)
          .values({ name })
          .returning({ id: keywords.id });
        keywordId = insertedKeyword.id;
      }

      // 3. Liên kết phim - keyword
      await tx.insert(movieKeywords)
        .values({ movieId, keywordId })
        .onConflictDoNothing(); // tránh trùng
    }

    return { movieId, keywordNames };
  });
};

