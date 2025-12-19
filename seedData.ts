import { db } from "./src/db/db";
import { movies, genres, movieGenres, keywords, movieKeywords, casts, movieCasts, trailers } from "./src/db/schema";
import axios from "axios";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
  params: { language: "en-US" },
});

async function seed() {

  // 1) Genres
  const { data: genresRes } = await api.get("/genre/movie/list");
  const genreMap: Record<number, string> = {}; // Lưu ý: id thường là number

  for (const g of genresRes.genres) {
    // Bước 1: Tìm xem genre này có trong DB chưa
    let [existing] = await db.select().from(genres).where(eq(genres.name, g.name));

    if (existing) {
      // Nếu có rồi -> Lấy ID của nó lưu vào map
      genreMap[g.id] = existing.id;
    } else {
      // Nếu chưa có -> Insert mới và lấy ID
      const [inserted] = await db.insert(genres).values({ name: g.name }).returning();
      genreMap[g.id] = inserted.id;
    }
  }

  // helper để insert phim
  async function insertMoviesFromEndpoint(endpoint: string, totalPages: number) {
    for (let page = 1; page <= totalPages; page++) {
      const { data: moviesRes } = await api.get(endpoint, { params: { page } });

      for (const m of moviesRes.results) {
        // check nếu phim đã có rồi thì bỏ qua
        const existed = await db.query.movies.findFirst({
          where: (tbl, { eq }) => eq(tbl.title, m.title),
        });
        if (existed) continue;

        const { data: detail } = await api.get(`/movie/${m.id}`);

        const [insertedMovie] = await db.insert(movies).values({
          title: m.title,
          overview: m.overview,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
          releaseDate: m.release_date,
          runtime: detail.runtime ?? null,
          isAdult: detail.adult ?? m.adult ?? false,
          originalTitle: m.original_title,
          originalLanguage: m.original_language,
          tmdbvoteAverage: m.vote_average,
          tmdbvoteCount: m.vote_count,
          popularity: m.popularity,
          status: detail.status ?? null,
        }).returning();

        const movieId = insertedMovie.id;

        // genres
        for (const gid of m.genre_ids) {
          const mappedGenreId = genreMap[gid]; // Kết quả là string (ID trong DB)

          if (mappedGenreId) {
            // Kiểm tra kỹ file schema.ts xem key là 'movieId' hay 'movie_id'
            // Dưới đây mình viết cả 2 trường hợp, bạn dùng cái nào thì xóa cái kia đi

            await db.insert(movieGenres).values({
              // Trường hợp 1: Nếu trong schema bạn khai báo là movieId: ...
              movieId: movieId,
              genreId: mappedGenreId

              // Trường hợp 2: Nếu schema khai báo là movie_id: ...
              // movie_id: movieId,
              // genre_id: mappedGenreId
            }).onConflictDoNothing();
          }
        }

        // keywords
        const { data: kwRes } = await api.get(`/movie/${m.id}/keywords`);
        for (const kw of kwRes.keywords) {
          let [kwRow] = await db.select().from(keywords).where(eq(keywords.name, kw.name));
          if (!kwRow) {
            [kwRow] = await db.insert(keywords).values({ name: kw.name }).returning();
          }
          await db.insert(movieKeywords).values({ movieId, keywordId: kwRow.id });
        }

        // cast
        const { data: creditsRes } = await api.get(`/movie/${m.id}/credits`);
        for (const c of creditsRes.cast.slice(0, 10)) {
          // check hoặc tạo cast
          let [castRow] = await db.select().from(casts).where(eq(casts.name, c.name));
          if (!castRow) {
            [castRow] = await db.insert(casts).values({
              name: c.name,
              profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w500${c.profile_path}` : null,
            }).returning();
          }

          // insert vào movie_casts nhưng bỏ qua nếu đã tồn tại
          await db.insert(movieCasts).values({
            movieId,
            castId: castRow.id,
            characterName: c.character ?? null,
          }).onConflictDoNothing(); // 🚀 thêm dòng này
        }


        // trailers
        const { data: videoRes } = await api.get(`/movie/${m.id}/videos`);
        const trailer = (videoRes.results as any[]).find(
          (v) => v.site === "YouTube" && v.type === "Trailer"
        );

        if (trailer) {
          await db.insert(trailers).values({
            movieId: movieId,
            title: trailer.name,
            youtubeUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
          });
        }
      }
      console.log(`✅ Done ${endpoint} page ${page}`);
    }
  }

  // 2) Seed nhiều loại phim
  await insertMoviesFromEndpoint("/movie/popular", 5);     // 5 trang popular
  await insertMoviesFromEndpoint("/movie/top_rated", 3);   // 3 trang top rated
  await insertMoviesFromEndpoint("/movie/upcoming", 2);    // 2 trang upcoming
  await insertMoviesFromEndpoint("/movie/now_playing", 2); // 2 trang now playing
}

seed()
  .then(() => { console.log("Seed completed!"); process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
