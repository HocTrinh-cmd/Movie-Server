import { relations } from "drizzle-orm";
import {
  users,
  movies,
  genres,
  keywords,
  casts,
  comments,
  favorites,
  ratings,
  watchHistory,
  movieGenres,
  movieCasts,
  movieKeywords,
} from "./schema";

// USERS
export const userRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  favorites: many(favorites),
  ratings: many(ratings),
  watchHistory: many(watchHistory),
}));

// MOVIES
export const moviesRelations = relations(movies, ({ many }) => ({
  movieGenres: many(movieGenres),
  movieCasts: many(movieCasts),
  movieKeywords: many(movieKeywords),
  comments: many(comments),
  favorites: many(favorites),
  ratings: many(ratings),
  watchHistory: many(watchHistory),
}));

// GENRES
export const genresRelations = relations(genres, ({ many }) => ({
  movieGenres: many(movieGenres),
}));

// CASTS
export const castsRelations = relations(casts, ({ many }) => ({
  movieCast: many(movieCasts),
}));

// KEYWORDS
export const keywordsRelations = relations(keywords, ({ many }) => ({
  movieKeywords: many(movieKeywords),
}));

// COMMENTS (self relation)
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [comments.movieId],
    references: [movies.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_parent",
  }),
  replies: many(comments, {
    relationName: "comment_parent",
  }),
}));

// FAVORITES
export const favoriteMoviesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [favorites.movieId],
    references: [movies.id],
  }),
}));

// RATINGS
export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [ratings.movieId],
    references: [movies.id],
  }),
}));

// WATCH HISTORY
export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [watchHistory.movieId],
    references: [movies.id],
  }),
}));

// MOVIE_GENRES
export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, {
    fields: [movieGenres.movieId],
    references: [movies.id],
  }),
  genre: one(genres, {
    fields: [movieGenres.genreId],
    references: [genres.id],
  }),
}));

// MOVIE_CASTS
export const movieCastsRelations = relations(movieCasts, ({ one }) => ({
  movie: one(movies, {
    fields: [movieCasts.movieId],
    references: [movies.id],
  }),
  cast: one(casts, {
    fields: [movieCasts.castId],
    references: [casts.id],
  }),
}));

// MOVIE_KEYWORDS
export const movieKeywordsRelations = relations(movieKeywords, ({ one }) => ({
  movie: one(movies, {
    fields: [movieKeywords.movieId],
    references: [movies.id],
  }),
  keyword: one(keywords, {
    fields: [movieKeywords.keywordId],
    references: [keywords.id],
  }),
}));
