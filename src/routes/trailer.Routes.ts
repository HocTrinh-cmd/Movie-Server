import { Router } from "express";
import * as trailerController from "../controllers/trailer.Controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/upload", asyncHandler(trailerController.uploadTrailer));
router.get("/movie/:movieId", asyncHandler(trailerController.getTrailersByMovieId));
router.put("/update/:trailerId", asyncHandler(trailerController.updateTrailer));
router.delete("/delete/:trailerId", asyncHandler(trailerController.deleteTrailer));

export default router;