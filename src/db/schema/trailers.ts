import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { movies } from "./movies";

//
// TRAILERS
//
export const trailers = pgTable("trailers", {
  id: uuid("id").primaryKey().defaultRandom(),
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  title: text("title"),
  youtubeUrl: text("youtube_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});