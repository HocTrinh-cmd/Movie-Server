// routes/auth.routes.ts
import { Router } from 'express';
import * as authController from '../controllers/auth.Controller';
import { requireAuth } from '../middleware/auth.Middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', requireAuth, asyncHandler(authController.getMe));
router.post('/resend-verification', asyncHandler(authController.resendVerification));
router.post('/change-password', requireAuth, asyncHandler(authController.changePassword));
router.post('/verify-email', asyncHandler(authController.verifyEmail));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/refresh-token', asyncHandler(authController.refreshToken));

export default router;
