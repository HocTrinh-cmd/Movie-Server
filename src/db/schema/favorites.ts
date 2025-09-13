import {
  pgTable,
  timestamp,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { movies } from "./movies";

//
// FAVORITES
//
export const favorites = pgTable("favorites", {
  userId: uuid("user_id").notNull().references(() => users.id),
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.movieId] }),
}));