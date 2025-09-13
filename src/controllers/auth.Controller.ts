// controllers/auth.controller.ts
import * as authService from '../services/auth.Service';
import { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.status(200).json({ message: 'Tài khoản đã tạo. Vui lòng xác minh email', user });
  } catch (error: any) {
    res.status(400).json({success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    res.status(200).json({ user, accessToken, refreshToken });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMe = async (req: Request, res: Response)=> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(400).json({ message: 'Unauthorized' });
    }
    const user = await authService.getMe(userId);
    res.status(200).json({ user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerification(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response)=> {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = (req as any).user?.userId;
    if (!userId) { 
      res.status(401).json({ message: 'Unauthorized' });
    }
    const result = await authService.changePassword(userId, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };
    if (!token) throw new Error('Token không hợp lệ');

    const result = await authService.verifyEmail(token);
    res.status(200).json({ status: 'success', result });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({ status: 'success', result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response)=> {
  try {
    const { token } = req.query as { token: string };
    const { newPassword } = req.body;
    if (!token || !newPassword) { 
      res.status(400).json({ message: 'Thiếu token hoặc mật khẩu' });
    }
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json({ status: 'success', result });
  } catch (error) {
    res.status(400).json({ message: 'token đã hết hạn' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
