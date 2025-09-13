import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { movies } from "./movies";

//
// CAST
//
export const casts = pgTable("casts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  profileUrl: text("profile_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//
// MOVIE_CAST (many-to-many)
//
export const movieCasts = pgTable("movie_casts", {
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  castId: uuid("cast_id").notNull().references(() => casts.id),
  characterName: text("character_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.movieId, table.castId] }),
}));