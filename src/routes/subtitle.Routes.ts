import { Router } from "express";
import * as subtitleController from "../controllers/subtitle.Controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/upload", asyncHandler(subtitleController.uploadSubtitle));
router.get("/movie/:movieId", asyncHandler(subtitleController.getSubtitlesByMovieId));
router.put("/update/:subtitleId", asyncHandler(subtitleController.updateSubtitle));
router.delete("/delete/:subtitleId", asyncHandler(subtitleController.deleteSubtitle));

export default router;