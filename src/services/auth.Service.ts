import { db } from '../db/db';
import { users } from '../db/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import axios from 'axios';
import { sendVerificationEmail } from '../utils/sendEmail';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { refreshTokens } from "../db/schema";
import { JwtPayload } from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const register = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error('Thiếu email hoặc mật khẩu');
    }

    const emailCheck = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=0f92f99e65bd4789a046704c20321038&email=${email}`
    );
    const data = emailCheck.data;

    if (
      data.deliverability !== 'DELIVERABLE' ||
      !data.is_valid_format.value ||
      data.is_disposable_email.value ||
      !data.is_smtp_valid.value
    ) {
      throw new Error('Email không hợp lệ');
    }

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (existingUser) {
      throw new Error('Email đã tồn tại');
    }

    const hashpass = await bcrypt.hash(password, 10);
    const verify_token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

    const result = await db.insert(users).values({
      email,
      passwordHash: hashpass,
      verifyToken: verify_token,
      isVerified: false,
    }).returning();

    await sendVerificationEmail(email, verify_token);
    return result[0];
  } catch (error: any) {
    throw new Error(error.message || 'Đăng ký không thành công');
  }
};

export const login = async (email: string, password: string) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) throw new Error('Tài khoản không tồn tại');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error('Mật khẩu không đúng');

    if (!user.isVerified) throw new Error("Tài khoản chưa được xác minh qua email.");

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  } catch (error: any) {
    throw new Error(error.message || 'Đăng nhập không thành công');
  }
};

export const getMe = async (userId: string) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw new Error("Không tìm thấy người dùng");
    return user;
  } catch (error: any) {
    throw new Error('Lấy thông tin người dùng không thành công: ' + error.message);
  }
};

export const resendVerification = async (email: string) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }

    if (user.isVerified) {
      throw new Error('Tài khoản đã được xác minh');
    }

    const newToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

    await db.update(users)
      .set({ verifyToken: newToken })
      .where(eq(users.email, email));

    await sendVerificationEmail(email, newToken);

    return { message: 'Đã gửi lại email xác minh' };
  } catch (error: any) {
    throw new Error('Gửi lại email xác minh không thành công: ' + error.message);

  }
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error('Mật khẩu cũ không đúng');
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));

    return { message: 'Đổi mật khẩu thành công' };
  } catch (error: any) {
    throw new Error('Đổi mật khẩu không thành công: ' + error.message);
  }
};

export const updateProfile = async (data: Partial<typeof users.$inferInsert>, userId: string) => {
  try {
    const user = await db.update(users).set(data).where(eq(users.id, userId)).returning();
    return user[0];
  } catch (error: any) {
    throw new Error('Cập nhật thông tin người dùng không thành công: ' + error.message); 
  }
}

export const verifyEmail = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    const user = await db.query.users.findFirst({ where: eq(users.email, decoded.email) });
    if (!user) throw new Error("Tài khoản không tồn tại");

    if (user.isVerified) {
      throw new Error('Tài khoản đã được xác minh trước đó.');
    }

    await db.update(users)
      .set({ isVerified: true, verifyToken: null })
      .where(eq(users.id, user.id));

    return { message: 'Tài khoản đã được xác minh thành công!' };
  } catch (error: any) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn' + error.message);
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }

    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

    await db.update(users)
      .set({ verifyToken: resetToken })
      .where(eq(users.email, email));

    const resetlink = `${process.env.FRONTEND_URL?.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

    await sendVerificationEmail(email, resetToken, resetlink, "reset");

    return { message: 'Đã gửi email đặt lại mật khẩu' };
  } catch (error: any) {
    throw new Error('Quên mật khẩu không thành công: ' + error.message);
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    const user = await db.query.users.findFirst({ where: eq(users.email, decoded.email) });

    if (!user) throw new Error('Token không hợp lệ hoặc đã hết hạn');

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ passwordHash: newHash, verifyToken: null })
      .where(eq(users.id, user.id));

    return { message: 'Đặt lại mật khẩu thành công' };
  } catch (error: any) {
    throw new Error('Đặt lại mật khẩu không thành công: ' + error.message);
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new Error("Refresh token không tồn tại");
    }

    const result = await handleRefreshToken(refreshToken); // Tạo token mới
    return result; // { accessToken: "..." }
  } catch (error: any) {
    throw new Error('Làm mới token không thành công: ' + error.message);
  }
};

export const handleRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("Thiếu token");
  }

  const tokenRecord = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, refreshToken),
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw new Error("Token hết hạn hoặc không hợp lệ");
  }

  const decoded = verifyRefreshToken(refreshToken);
  const newAccessToken = generateAccessToken((decoded as JwtPayload).userId);

  return {
    accessToken: newAccessToken,
  };
};

