import { Router } from 'express';
import * as movieController from '../controllers/movie.Controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();


router.get('/', asyncHandler(movieController.getMovies));
router.get('/discover/movie', asyncHandler(movieController.discoverMoviesController));
router.get('/trending', asyncHandler(movieController.getMostViewedMovies));
router.get('/:id/detail', asyncHandler(movieController.getMovieById));
router.get('/search/query', asyncHandler(movieController.searchMovies));

export default router;