import { Router } from "express";
import * as ratingController from "../controllers/rating.Controller";
import { requireAuth } from "../middlewares/auth.Middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/rate", requireAuth, asyncHandler(ratingController.rateMovie));
router.get("/getrate", asyncHandler(ratingController.getRatings));

export default router;