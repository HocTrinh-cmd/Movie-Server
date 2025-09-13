import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  real,
  uuid,
} from "drizzle-orm/pg-core";

//
// MOVIES
//
export const movies = pgTable("movies", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  overview: text("overview"),
  posterUrl: text("poster_url"),
  backdropUrl: text("backdrop_url"),
  releaseDate: text("release_date"),
  runtime: integer("runtime"), // phút
  isAdult: boolean("is_adult").default(false),
  originalTitle: text("original_title"),
  originalLanguage: text("original_language"),
  voteAverage: real("vote_average").default(0),
  voteCount: integer("vote_count").default(0),
  tmdbvoteAverage: real("tmdb_vote_average").default(0),
  tmdbvoteCount: integer("tmdb_vote_count").default(0),
  popularity: real("popularity").default(0),
  status: varchar("status", { length: 30 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
