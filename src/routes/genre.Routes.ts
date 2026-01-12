import { Router } from "express";
import * as genreController from "../controllers/genres.Controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/getAllGenres", asyncHandler(genreController.getAllGenres));
router.get("/:id/movies", asyncHandler(genreController.getMoviesByGenreId));
router.post("/add", asyncHandler(genreController.addGenre));
router.put("/:id/update", asyncHandler(genreController.updateGenre));
router.delete("/:id/delete", asyncHandler(genreController.deleteGenre));
export default router;