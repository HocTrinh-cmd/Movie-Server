import { Router } from "express";
import * as trailerController from "../controllers/trailer.Controller";

const router = Router();

router.post("/upload", trailerController.uploadTrailer);
router.get("/movie/:movieId", trailerController.getTrailersByMovieId);
router.put("/update/:trailerId", trailerController.updateTrailer);
router.delete("/delete/:trailerId", trailerController.deleteTrailer);

export default router;