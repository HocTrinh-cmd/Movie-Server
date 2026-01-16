import { db } from '../db/db';
import { movies, movieKeywords, keywords } from '../db/schema';
import { count, eq, ilike, or } from 'drizzle-orm';
import { ApiError } from '../utils/ApiError';

/**
 * Get keywords by movie title
 */
export const getKeywordsByMovieTitle = async (title: string) => {
  if (!title) {
    throw new ApiError(400, "Movie title is required");
  }

  // Cách query này tự động "nhảy" qua 3 bảng: movies -> movieKeywords -> keywords
  const movieWithKeywords = await db.query.movies.findFirst({
    where: (movies, { ilike }) => ilike(movies.title, `%${title}%`),
    with: {
      movieKeywords: {
        with: {
          keyword: true // Lấy thông tin chi tiết từ bảng keywords
        }
      }
    }
  });

  // 1. Trường hợp không tìm thấy phim
  if (!movieWithKeywords) {
    return {
      foundMovie: false,
      message: `Movie '${title}' not found`,
      keywords: []
    };
  }

  // 2. Trường hợp tìm thấy phim nhưng phim chưa được gắn keyword nào
  if (movieWithKeywords.movieKeywords.length === 0) {
    return {
      foundMovie: true,
      movieName: movieWithKeywords.title,
      message: "Movie found but has no keywords",
      keywords: []
    };
  }

  // 3. Có dữ liệu -> Map lại cho đẹp (Bỏ bớt mấy cái ID thừa)
  const result = movieWithKeywords.movieKeywords.map((mk) => ({
    id: mk.keyword.id,
    name: mk.keyword.name
  }));

  return {
    foundMovie: true,
    movieName: movieWithKeywords.title,
    keywords: result
  };
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