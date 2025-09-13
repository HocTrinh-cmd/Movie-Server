import { Router } from "express";
import * as favoriteController from "../controllers/favorite.Controller"
import { requireAuth } from "../middleware/auth.Middleware";

const router = Router();

router.get("/getFavoriteMovie", requireAuth as any, favoriteController.getFavoriteMovie);
router.get("/isFavorite", requireAuth as any, favoriteController.isFavorite);
router.post("/toggleFavoriteMovie", requireAuth as any, favoriteController.toggleFavoriteMovie);

export default router;