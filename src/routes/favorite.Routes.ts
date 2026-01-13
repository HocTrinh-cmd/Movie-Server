import { Router } from "express";
import * as favoriteController from "../controllers/favorite.Controller"
import { requireAuth } from "../middlewares/auth.Middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/getFavoriteMovie", requireAuth , asyncHandler(favoriteController.getFavorites));
router.get("/isFavorite/:movieId", requireAuth, asyncHandler(favoriteController.checkIsFavorite));
router.post("/toggleFavoriteMovie", requireAuth, asyncHandler(favoriteController.toggleFavorite));

export default router;