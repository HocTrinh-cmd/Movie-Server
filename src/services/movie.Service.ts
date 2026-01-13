import { db } from '../db/db';
import { movieCasts, movieGenres, movies } from '../db/schema';
import { eq, inArray, desc, sql, count, countDistinct } from 'drizzle-orm';
import { ApiError } from '../utils/ApiError';
import { uploadLocalFileToFirebase, deleteFileFromFirebase } from './firebase.Service';

type AddMovieInput = {
  title: string;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate?: string; // Drizzle 'date' expects string 'YYYY-MM-DD'
  runtime?: number;
  videoUrl?: string;
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
  const offset = (page - 1) * perPage;

  // 1. Lấy danh sách phim (Records)
  const movieList = await db.query.movies.findMany({
    limit: perPage,
    offset: offset,
    orderBy: (m) => desc(m.releaseDate),
  });

  // 2. Đếm tổng số lượng (Total Records)
  const totalResult = await db.select({ value: count() }).from(movies);
  const totalRecords = totalResult[0].value;

  // 3. Trả về đầy đủ
  return {
    records: movieList,
    totalRecords, // Trả về biến này để Controller dùng
    page,
    perPage
  };
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
  const offset = (page - 1) * perPage;

  // Nếu không chọn genre nào thì gọi hàm lấy tất cả (đã có phân trang)
  if (!genres || genres.length === 0) {
    return getMovies({ page, perPage });
  }

  // -------------------------
  // TRƯỜNG HỢP 1: Match ALL (Phải có ĐỦ tất cả genres)
  // -------------------------
  if (match === "all") {
    // 1. Query lấy dữ liệu (Records)
    const data = await db
      .select({ movie: movies })
      .from(movies)
      .innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .where(inArray(movieGenres.genreId, genres))
      .groupBy(movies.id)
      .having(sql`COUNT(DISTINCT ${movieGenres.genreId}) = ${genres.length}`) // Logic: Số genre tìm thấy = Số genre yêu cầu
      .limit(perPage)
      .offset(offset);

    const records = data.map((item) => item.movie);

    // 2. Query đếm tổng số (Total Records) - Hơi phức tạp vì phải count trên group by
    // Cách tối ưu: Dùng subquery hoặc query riêng lấy ID rồi đếm length
    const allMatches = await db
      .select({ id: movies.id })
      .from(movies)
      .innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .where(inArray(movieGenres.genreId, genres))
      .groupBy(movies.id)
      .having(sql`COUNT(DISTINCT ${movieGenres.genreId}) = ${genres.length}`);

    const totalRecords = allMatches.length;

    return { records, totalRecords, page, perPage };
  }

  // -------------------------
  // TRƯỜNG HỢP 2: Match ANY (Có ít nhất 1 genre là được)
  // -------------------------
  // 1. Lấy dữ liệu
  const records = await db.query.movies.findMany({
    where: (m, { inArray }) => inArray(movieGenres.genreId, genres), // Cú pháp này Drizzle tự lo join
    limit: perPage,
    offset: offset,
    orderBy: (m) => desc(m.releaseDate),
    with: {
      movieGenres: { with: { genre: true } },
    },
  });

  // 2. Đếm tổng số (Dùng countDistinct để tránh trùng lặp khi 1 phim có nhiều genre khớp)
  const totalResult = await db
    .select({ value: countDistinct(movies.id) })
    .from(movies)
    .innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
    .where(inArray(movieGenres.genreId, genres));

  const totalRecords = totalResult[0].value;

  return { records, totalRecords, page, perPage };
};

export const getMostViewedMovies = async (limit = 10) => {
  const data = await db.query.movies.findMany({
    limit: limit, // Lấy đúng số lượng (5, 10, hay 20 tùy truyền vào)
    orderBy: (m) => desc(m.popularity), // Sắp xếp theo độ phổ biến giảm dần
    with: {
      movieGenres: { with: { genre: true } }, // Kèm thể loại để hiển thị card
    },
  });

  return data; // Trả về mảng phim luôn, không cần object { records, total... }
};

export const getMovieDetailById = async (id: string) => {
  if (!id) throw new ApiError(400, "Movie ID is required");

  // Tăng view (Fire and forget - không await để tránh chặn request chính)
  increaseViewCount(id).catch(err => console.error("Failed to count view:", err));

  const movie = await db.query.movies.findFirst({
    where: (m, { eq }) => eq(m.id, id),
    with: {
      movieCasts: { with: { cast: true } },
      movieGenres: { with: { genre: true } },
      movieKeywords: { with: { keyword: true } }, // Load cả tên keyword thay vì chỉ ID
      comments: {
        with: { user: true, replies: true },
        orderBy: (c, { desc }) => [desc(c.createdAt)] // Sắp xếp comment mới nhất
      },
    },
  });

  if (!movie) throw new ApiError(404, 'Movie not found');
  return movie;
};

export const searchMovies = async (query: string) => {
  if (!query || query.trim() === '') {
    return [];
  }

  const movieList = await db.query.movies.findMany({
    where: (m, { ilike }) => ilike(m.title, `%${query}%`),
    limit: 20, // Giới hạn kết quả tìm kiếm
  });

  return movieList;
};

// Hàm này giữ try/catch vì nó là side-effect, không nên làm crash luồng chính
export const increaseViewCount = async (id: string) => {
  try {
    await db.update(movies)
      .set({
        popularity: sql`${movies.popularity} + 1`
      })
      .where(eq(movies.id, id));
  } catch (error: any) {
    console.error('Failed to increase view count:', error.message);
  }
};

export const addMovie = async (data: AddMovieInput) => {
  if (!data.title) throw new ApiError(400, "Title is required");

  const [newMovie] = await db.insert(movies).values({
    title: data.title,
    overview: data.overview,
    posterUrl: data.posterUrl,
    backdropUrl: data.backdropUrl,
    releaseDate: data.releaseDate || null, // Truyền string 'YYYY-MM-DD' hoặc null
    runtime: data.runtime,
    videoUrl: data.videoUrl,
    isAdult: data.isAdult,
    originalTitle: data.originalTitle,
    originalLanguage: data.originalLanguage,
    voteAverage: data.voteAverage,
    voteCount: data.voteCount,
    popularity: data.popularity,
    status: data.status,
  }).returning();

  // Thêm genres
  if (data.genreIds && data.genreIds.length > 0) {
    await db.insert(movieGenres).values(
      data.genreIds.map((genreId) => ({
        movieId: newMovie.id,
        genreId,
      }))
    );
  }

  // Thêm cast
  if (data.castIds && data.castIds.length > 0) {
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
  movieData: Partial<AddMovieInput>
) => {
  if (!id) throw new ApiError(400, "Movie ID is required");

  return await db.transaction(async (transaction) => {
    // 1. Tách các trường quan hệ ra khỏi data update
    const { genreIds, castIds, ...coreData } = movieData;

    // 2. Update bảng Movie
    const result = await transaction
      .update(movies)
      .set({
        ...coreData,
        // Nếu releaseDate là undefined thì giữ nguyên, nếu null thì set null
        releaseDate: coreData.releaseDate === undefined ? undefined : coreData.releaseDate,
      })
      .where(eq(movies.id, id))
      .returning();

    if (result.length === 0) throw new ApiError(404, "Movie not found");

    // 3. Update Genres (Xóa cũ -> Thêm mới)
    if (genreIds) {
      await transaction.delete(movieGenres).where(eq(movieGenres.movieId, id));
      if (genreIds.length > 0) {
        await transaction.insert(movieGenres).values(
          genreIds.map((gid) => ({ movieId: id, genreId: gid }))
        );
      }
    }

    // 4. Update Casts (Xóa cũ -> Thêm mới)
    if (castIds) {
      await transaction.delete(movieCasts).where(eq(movieCasts.movieId, id));
      if (castIds.length > 0) {
        await transaction.insert(movieCasts).values(
          castIds.map((cid) => ({ movieId: id, castId: cid }))
        );
      }
    }

    return result[0];
  });
};

export const deleteMovie = async (id: string) => {
  if (!id) throw new ApiError(400, "Movie ID is required");

  const result = await db.delete(movies).where(eq(movies.id, id)).returning();

  if (result.length === 0) throw new ApiError(404, 'Movie not found');

  return result[0];
};

export const uploadMovieVideo = async (movieId: string, file: Express.Multer.File) => {
  if (!movieId) throw new ApiError(400, "Movie ID is required");
  if (!file) throw new ApiError(400, "Video file is required");

  // Kiểm tra xem phim có tồn tại không
  const movie = await db.query.movies.findFirst({
    where: eq(movies.id, movieId)
  });

  if (!movie) {
    // Nếu phim không tồn tại, nhớ xóa file tạm đã upload lên server để tránh rác
    if (file.path) {
      // Cần import fs ở đầu file nếu dùng fs.unlinkSync, 
      // hoặc dùng cơ chế của storage.Service đã handle việc xóa ở finally rồi,
      // nhưng ở đây file chưa vào storage service nên ta cứ để Controller hoặc middleware lo,
      // hoặc gọi hàm upload sẽ tự xóa.
    }
    throw new ApiError(404, "Movie not found");
  }

  // 1. Nếu phim đã có video cũ, xóa video cũ trên Firebase đi cho đỡ tốn tiền
  if (movie.videoUrl) {
    await deleteFileFromFirebase(movie.videoUrl);
  }

  // 2. Upload video mới (Dùng file.path vì đây là file lưu trên đĩa)
  const videoUrl = await uploadLocalFileToFirebase(
    file.path,
    'movies',
    file.originalname,
    file.mimetype
  );

  // 3. Cập nhật URL vào Database
  const [updatedMovie] = await db.update(movies)
    .set({
      videoUrl: videoUrl,
      updatedAt: new Date()
    })
    .where(eq(movies.id, movieId))
    .returning();

  return updatedMovie;
};