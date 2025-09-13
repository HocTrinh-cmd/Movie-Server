import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { movies } from "./movies";

//
// KEYWORDS
//
export const keywords = pgTable("keywords", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const movieKeywords = pgTable("movie_keywords", {
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  keywordId: uuid("keyword_id").notNull().references(() => keywords.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.movieId, table.keywordId] }),
}));