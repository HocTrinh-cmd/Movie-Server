// routes/auth.routes.ts
import { Router } from 'express';
import * as authController from '../controllers/auth.Controller';
import { requireAuth } from '../middleware/auth.Middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth as any, authController.getMe);
router.post('/resend-verification', authController.resendVerification);
router.post('/change-password', requireAuth as any, authController.changePassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

export default router;
