import {
  pgTable,
  timestamp,
  uuid,
  integer
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { movies } from "./movies";

//
// WATCH HISTORY
//
export const watchHistory = pgTable("watch_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
  progress: integer("progress").default(0).notNull(), // thời gian đã xem tính bằng giây
  duration: integer("duration"), // tổng thời lượng phim
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});