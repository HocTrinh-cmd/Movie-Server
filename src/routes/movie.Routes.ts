import { Router } from 'express';
import * as movieController from '../controllers/movie.Controller';

const router = Router();


router.get('/movie', movieController.getMovies);
router.get('/discover/movie', movieController.discoverMoviesController);
router.get('/:id/detail', movieController.getMovieById);
router.get('/search/query', movieController.searchMovies);

export default router;