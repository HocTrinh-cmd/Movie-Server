import { db } from "../db/db";
import { movies, movieKeywords } from "../db/schema";
import { eq, ilike, inArray, or, and, desc, count, sql, getTableColumns } from "drizzle-orm";
import { ApiError } from "../utils/ApiError";

export const getRelatedMoviesBySearchQuery = async (
    query: string,
    { page, perPage }: { page: number; perPage: number }
) => {
    if (!query) throw new ApiError(400, "Search query is required");

    // --- BƯỚC 1: Tìm phim "Gốc" để lấy bộ Keywords mẫu ---
    const anchorMovie = await db.query.movies.findFirst({
        where: (m, { ilike }) => ilike(m.title, `%${query}%`),
        with: {
            movieKeywords: true
        }
    });

    // Nếu không tìm thấy phim nào khớp tên -> Chuyển sang tìm kiếm thuần theo tên
    if (!anchorMovie) {
        return searchOnlyByTitle(query, page, perPage);
    }

    const keywordIds = anchorMovie.movieKeywords.map(mk => mk.keywordId);

    // --- BƯỚC 2: Query kết hợp (Title Match + Keyword Match) ---
    const limit = perPage;
    const offset = (page - 1) * limit;

    // Logic điều kiện: (Trùng Tên) HOẶC (Có Keyword liên quan)
    // Lưu ý: Nếu keywordIds rỗng thì chỉ tìm theo tên
    const whereCondition = keywordIds.length > 0
        ? or(
            ilike(movies.title, `%${query}%`),
            inArray(movieKeywords.keywordId, keywordIds)
        )
        : ilike(movies.title, `%${query}%`);

    const relatedMovies = await db
        .select({
            ...getTableColumns(movies),

            // Tạo cột chấm điểm ưu tiên: Khớp tên = 1, Không khớp = 0
            isTitleMatch: sql<number>`CASE WHEN ${movies.title} ILIKE ${`%${query}%`} THEN 1 ELSE 0 END`.as('is_title_match'),

            // Đếm số lượng keyword trùng
            matchCount: count(movieKeywords.keywordId),

            // Đếm tổng số trang (Window function)
            totalCount: sql<number>`count(*) over()`.mapWith(Number)
        })
        .from(movies)
        .leftJoin(movieKeywords, eq(movies.id, movieKeywords.movieId))
        .where(whereCondition)
        .groupBy(movies.id)
        .orderBy(
            // 1. Phim khớp tên lên đầu
            desc(sql`is_title_match`),

            // 2. Phim trùng nhiều keyword lên nhì
            desc(count(movieKeywords.keywordId)),

            // 3. Phim nổi tiếng lên ba
            desc(movies.popularity)
        )
        .limit(limit)
        .offset(offset);

    // --- XỬ LÝ KẾT QUẢ ---
    const total = relatedMovies.length > 0 ? relatedMovies[0].totalCount : 0;

    // Loại bỏ các trường phụ trước khi trả về
    const cleanMovies = relatedMovies.map(({ totalCount, isTitleMatch, matchCount, ...rest }) => rest);

    return {
        anchorMovie: anchorMovie.title,
        movies: cleanMovies,
        total
    };
};

// --- HÀM PHỤ ĐÃ ĐƯỢC FIX ---
const searchOnlyByTitle = async (query: string, page: number, perPage: number) => {
    // 1. Fix lỗi Type: Trả về Object chuẩn thay vì mảng rỗng []
    if (!query || query.trim() === '') {
        return { 
            anchorMovie: null, 
            movies: [], 
            total: 0 
        };
    }

    const limit = perPage;
    const offset = (page - 1) * limit;

    // 2. Fix lỗi Logic: Dùng .select() để hỗ trợ phân trang & đếm total
    const rows = await db
        .select({
            ...getTableColumns(movies),
            totalCount: sql<number>`count(*) over()`.mapWith(Number)
        })
        .from(movies)
        .where(ilike(movies.title, `%${query}%`))
        .limit(limit)
        .offset(offset);

    // 3. Xử lý kết quả
    const total = rows.length > 0 ? rows[0].totalCount : 0;
    const cleanMovies = rows.map(({ totalCount, ...rest }) => rest);

    return { 
        anchorMovie: null, 
        movies: cleanMovies, 
        total: total 
    };
}