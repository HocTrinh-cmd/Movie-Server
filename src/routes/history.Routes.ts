import { Router } from "express";
import * as historyController from "../controllers/history.Controller";
import { requireAuth } from "../middlewares/auth.Middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/save", requireAuth, asyncHandler(historyController.upsertWatchHistory));
router.get("/watch-history", requireAuth, asyncHandler(historyController.getWatchHistory));
router.delete("/deleteHistory/:watchHistoryId", requireAuth, asyncHandler(historyController.deleteWatchHistory));

export default router;