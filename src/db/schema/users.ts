import {
  pgTable,
  text,
  boolean,
  timestamp,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";

//
// USERS
//
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isVerified: boolean("is_verified").default(false),
  verifyToken: text("verify_token"),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//
// REFRESH TOKENS
//
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  token: text("token").notNull(), // Có thể hash nếu muốn bảo mật cao hơn
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isRevoked: boolean("is_revoked").default(false),
});
