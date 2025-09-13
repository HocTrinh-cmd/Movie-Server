import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { movies } from "./movies";

//
// SUBTITLE
//
export const subtitles = pgTable("subtitles", {
  id: uuid("id").primaryKey().defaultRandom(),
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  lang: varchar("lang", { length: 5 }), // ví dụ: "vi", "en"
  label: text("label"), // Tiếng Việt, English
  fileUrl: text("file_url"), // Đường dẫn tới .vtt
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});