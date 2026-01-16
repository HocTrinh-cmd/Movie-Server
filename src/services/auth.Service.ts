import { db } from '../db/db';
import { users, refreshTokens } from '../db/schema';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { eq, asc } from 'drizzle-orm';
import validator from "validator";
import { sendVerificationEmail } from '../utils/sendEmail';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { ApiError } from '../utils/ApiError';
import { RANKS, RANK_THRESHOLDS } from "../constants/rank";

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

  const MAX_DEVICES = 5;

  // Lấy danh sách token cũ của user này, sắp xếp từ CŨ NHẤT -> MỚI NHẤT
  const existingTokens = await db.query.refreshTokens.findMany({
    where: eq(refreshTokens.userId, user.id),
    orderBy: [asc(refreshTokens.createdAt)],
  });

  // Nếu đã đạt giới hạn (hoặc hơn), xóa bớt những cái cũ nhất đi
  if (existingTokens.length >= MAX_DEVICES) {
    // Tính số lượng cần xóa. Ví dụ đang có 5, thêm 1 cái mới là 6 -> Cần xóa 1 cái cũ nhất
    const tokensToDeleteCount = existingTokens.length - MAX_DEVICES + 1;
    const tokensToDelete = existingTokens.slice(0, tokensToDeleteCount);

    for (const token of tokensToDelete) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, token.id));
    }
  }

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
  });

  return {
    accessToken,
    refreshToken,
    user: {
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      rank: user.rank,
      points: user.points,
    },
  };
};

export const getMe = async (userId: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const addPoints = async (userId: string, pointsToAdd: number) => {
  // Lấy thông tin điểm hiện tại
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, points: true, rank: true }
  });

  if (!user) return;

  // Tính toán điểm mới và hạng mới
  const newPoints = (user.points || 0) + pointsToAdd;
  let newRank = user.rank || RANKS.BRONZE;

  // Logic kiểm tra thăng hạng (Check từ cao xuống thấp)
  if (newPoints >= RANK_THRESHOLDS[RANKS.DIAMOND]) {
    newRank = RANKS.DIAMOND;
  } else if (newPoints >= RANK_THRESHOLDS[RANKS.GOLD]) {
    newRank = RANKS.GOLD;
  } else if (newPoints >= RANK_THRESHOLDS[RANKS.SILVER]) {
    newRank = RANKS.SILVER;
  }

  // Update vào Database
  await db.update(users)
    .set({ points: newPoints, rank: newRank })
    .where(eq(users.id, userId));

  // (Optional) Log ra console để bạn dễ debug xem có chạy không
  console.log(`[Rank System] User ${userId}: +${pointsToAdd} points | Total: ${newPoints} | Rank: ${newRank}`);
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

export const checkRefreshToken = async (token: string) => {
  if (!token) throw new ApiError(400, "Refresh token is required");

  // Verify chữ ký JWT (crypto check)
  let decoded: JwtPayload;
  try {
    // Hàm verifyRefreshToken của bạn phải trả về decoded payload
    decoded = verifyRefreshToken(token) as JwtPayload;
  } catch (error) {
    throw new ApiError(403, "Invalid refresh token signature");
  }

  //Kiểm tra trong Database (database check)
  const tokenRecord = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, token),
  });

  // Các logic validate dữ liệu DB
  if (!tokenRecord) {
    throw new ApiError(403, "Refresh token not found in database (Re-login required)");
  }

  if (tokenRecord.isRevoked) {
    // ⚠️ Cảnh báo bảo mật: Token đã bị thu hồi nhưng vẫn cố dùng -> Có thể là hacker
    throw new ApiError(403, "Refresh token has been revoked");
  }

  if (new Date() > tokenRecord.expiresAt) {
    throw new ApiError(403, "Refresh token expired");
  }

  // Kiểm tra user id trong token có khớp với DB không
  if (tokenRecord.userId !== decoded.userId) {
    throw new ApiError(403, "Token does not belong to this user");
  }

  return {
    isValid: true,
    userId: tokenRecord.userId,
    expiresAt: tokenRecord.expiresAt
  };
};

export const handleRefreshToken = async (refreshToken: string) => {
  // Gọi hàm check ở trên, nếu lỗi nó sẽ tự throw ApiError
  const { userId } = await checkRefreshToken(refreshToken);

  // Nếu hợp lệ, tạo Access Token mới
  const newAccessToken = generateAccessToken(userId);

  return {
    accessToken: newAccessToken,
  };
};