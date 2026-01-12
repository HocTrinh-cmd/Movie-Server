// controllers/auth.controller.ts
import * as authService from '../services/auth.Service';
import { Request, Response } from 'express';
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');
  const user = await authService.register(email, password);
  new SuccessResponse('Account created. Please verify your email', user).send(res);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  new SuccessResponse('Login successful', { user, accessToken, refreshToken }).send(res);
};

export const getMe = async (req: Request, res: Response)=> {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const user = await authService.getMe(userId);
  new SuccessResponse('User retrieved successfully', { user }).send(res);
};

export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');
  const result = await authService.resendVerification(email);
  new SuccessResponse('Verification email sent', result).send(res);
};

export const changePassword = async (req: Request, res: Response)=> {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!oldPassword || !newPassword) throw new ApiError(400, 'Old password and new password are required');
  const result = await authService.changePassword(userId, oldPassword, newPassword);
  new SuccessResponse('Password changed successfully', result).send(res);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  if (!token) throw new ApiError(400, 'Token is invalid');
  const result = await authService.verifyEmail(token);
  new SuccessResponse('Email verified successfully', result).send(res);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');
  const result = await authService.forgotPassword(email);
  new SuccessResponse('Password reset email sent', result).send(res);
};

export const resetPassword = async (req: Request, res: Response)=> {
  const { token } = req.query as { token: string };
  const { newPassword } = req.body;
  if (!token || !newPassword) throw new ApiError(400, 'Token and new password are required');
  const result = await authService.resetPassword(token, newPassword);
  new SuccessResponse('Password reset successfully', result).send(res);
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'Refresh token is required');
  const result = await authService.refreshAccessToken(refreshToken);
  new SuccessResponse('Token refreshed successfully', result).send(res);
};
