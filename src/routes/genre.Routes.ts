import { Router } from "express";
import * as genreController from "../controllers/genres.Controller";

const router = Router();

router.get("/getAllGenres", genreController.getAllGenres);
router.get("/:id/movies", genreController.getMoviesByGenreId);
router.post("/add", genreController.addGenre);
router.put("/:id/update", genreController.updateGenre);
router.delete("/:id/delete", genreController.deleteGenre);

export default router;