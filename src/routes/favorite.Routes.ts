import { Router } from "express";
import * as favoriteController from "../controllers/favorite.Controller"
import { requireAuth } from "../middleware/auth.Middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/getFavoriteMovie", requireAuth , asyncHandler(favoriteController.getFavoriteMovie));
router.get("/isFavorite", requireAuth, asyncHandler(favoriteController.isFavorite));
router.post("/toggleFavoriteMovie", requireAuth, asyncHandler(favoriteController.toggleFavoriteMovie));

export default router;