import { Router } from "express";
import * as ratingController from "../controllers/rating.Controller";
import { requireAuth } from "../middleware/auth.Middleware";

const router = Router();

router.post("/rate", requireAuth as any, ratingController.rateMovie);
router.get("/getrate", ratingController.getRatings);

export default router;