import { Router } from 'express';
import * as movieController from '../controllers/movie.Controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();


router.get('/movie', asyncHandler(movieController.getMovies));
router.get('/discover/movie', asyncHandler(movieController.discoverMoviesController));
router.get('/:id/detail', asyncHandler(movieController.getMovieById));
router.get('/search/query', asyncHandler(movieController.searchMovies));

export default router;