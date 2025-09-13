import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { movies } from "./movies";

//
// COMMENTS
//
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  parentId: uuid("parent_id"),
  content: text("content").notNull(),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at").$type<Date | null>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});