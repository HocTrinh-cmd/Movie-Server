import {
  pgTable,
  timestamp,
  real,
  uuid,
  unique
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { movies } from "./movies";

//
// RATINGS
//
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  score: real("score").notNull(), // 0.0 - 10.0 ⭐ số thực (float)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uq: unique().on(table.userId, table.movieId),
}));