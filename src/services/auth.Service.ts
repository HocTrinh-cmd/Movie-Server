import { db } from '../db/db';
import { users, refreshTokens } from '../db/schema';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import validator from "validator";
import { sendVerificationEmail } from '../utils/sendEmail';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { ApiError } from '../utils/ApiError';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in .env file");
}

export const register = async (email: string, password: string) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  if (!validator.isEmail(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existingUser) {
    throw new ApiError(409, 'Email already exists');
  }

  try {
    const hashpass = await bcrypt.hash(password, 10);
    const verify_token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

    const [newUser] = await db.insert(users).values({
      email,
      passwordHash: hashpass,
      verifyToken: verify_token,
      isVerified: false,
    }).returning();

    await sendVerificationEmail(email, verify_token);

    return newUser;

  } catch (error: any) {
    if (error.message && error.message.includes("check mail")) {
      await db.delete(users).where(eq(users.email, email));
    }
    throw new ApiError(500, error.message || 'Registration failed');
  }
};

export const login = async (email: string, password: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isVerified) throw new ApiError(403, "Account not verified. Please check your email.");

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  };
};

export const getMe = async (userId: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const resendVerification = async (email: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (!user) throw new ApiError(404, 'User not found');
  if (user.isVerified) throw new ApiError(400, 'Account is already verified');

  const newToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

  await db.update(users)
    .set({ verifyToken: newToken })
    .where(eq(users.email, email));

  await sendVerificationEmail(email, newToken);

  return { message: 'Verification email resent successfully' };
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) throw new ApiError(400, 'Incorrect old password');

  const newHash = await bcrypt.hash(newPassword, 10);

  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));

  return { message: 'Password changed successfully' };
};

export const updateProfile = async (userId: string, data: Partial<typeof users.$inferInsert>) => {
  const updateData = { ...data };

  if ('id' in updateData) {
    delete (updateData as { id?: unknown }).id;
  }

  const [updatedUser] = await db.update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();
    
  if (!updatedUser) throw new ApiError(404, 'User not found');

  return updatedUser;
}

export const verifyEmail = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    const user = await db.query.users.findFirst({ where: eq(users.email, decoded.email) });
    if (!user) throw new ApiError(404, "User not found");

    if (user.isVerified) {
      throw new ApiError(400, 'Account is already verified.');
    }

    await db.update(users)
      .set({ isVerified: true, verifyToken: null })
      .where(eq(users.id, user.id));

    return { message: 'Email verified successfully!' };
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, 'Invalid or expired token');
  }
};

export const forgotPassword = async (email: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new ApiError(404, 'User not found');

  const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

  await db.update(users)
    .set({ verifyToken: resetToken })
    .where(eq(users.email, email));

  const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
  const resetlink = `${baseUrl?.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

  await sendVerificationEmail(email, resetToken, resetlink, "reset");

  return { message: 'Password reset email sent' };
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    const user = await db.query.users.findFirst({ where: eq(users.email, decoded.email) });
    if (!user) throw new ApiError(404, 'User not found');

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ passwordHash: newHash, verifyToken: null })
      .where(eq(users.id, user.id));

    return { message: 'Password reset successfully' };
  } catch (error) {
    throw new ApiError(400, 'Invalid or expired token');
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token required");
  }
  return await handleRefreshToken(refreshToken);
};

export const handleRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) throw new ApiError(400, "Token required");

  const tokenRecord = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, refreshToken),
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw new ApiError(403, "Token expired or invalid");
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken((decoded as JwtPayload).userId);

    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    throw new ApiError(403, "Invalid token");
  }
};