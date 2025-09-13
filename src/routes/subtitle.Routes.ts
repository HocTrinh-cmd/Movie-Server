import { Router } from "express";
import * as subtitleController from "../controllers/subtitle.Controller";

const router = Router();

router.post("/upload", subtitleController.uploadSubtitle);
router.get("/movie/:movieId", subtitleController.getSubtitlesByMovieId);
router.put("/update/:subtitleId", subtitleController.updateSubtitle);
router.delete("/delete/:subtitleId", subtitleController.deleteSubtitle);

export default router;