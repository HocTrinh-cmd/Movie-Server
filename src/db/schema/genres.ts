import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { movies } from "./movies";

//
// GENRES
//
export const genres = pgTable("genres", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//
// MOVIE_GENRES (many-to-many)
//
export const movieGenres = pgTable("movie_genres", {
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  genreId: uuid("genre_id").notNull().references(() => genres.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.movieId, table.genreId] }),
}));