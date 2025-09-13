import { Router } from "express";
import * as historyController from "../controllers/history.Controller";
import { requireAuth } from "../middleware/auth.Middleware";

const router = Router();

router.post("/save", requireAuth as any, historyController.upsertWatchHistory);
router.get("/watch-history", requireAuth as any, historyController.getWatchHistory);
router.delete("/deleteHistory/:watchHistoryId", requireAuth as any, historyController.deleteWatchHistory);

export default router;