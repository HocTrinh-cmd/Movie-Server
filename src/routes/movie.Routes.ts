import { Router } from 'express';
import * as movieController from '../controllers/movie.Controller';
import { uploadVideoMiddleware } from '../middlewares/multer';
import { asyncHandler } from '../utils/asyncHandler';
import { optionalAuth } from '../middlewares/auth.Middleware';

const router = Router();


router.get('/', asyncHandler(movieController.getMovies));
router.get('/discover/movie', asyncHandler(movieController.discoverMoviesController));
router.get('/most-viewed', asyncHandler(movieController.getMostViewedMovies));
router.get('/trending', asyncHandler(movieController.getMostViewedMovies));
router.get('/:id/detail', optionalAuth, asyncHandler(movieController.getMovieById));
router.get('/search', asyncHandler(movieController.getRelatedMovies));
router.post(
    '/:id/video', 
    uploadVideoMiddleware.single('video'), // 'video' là key trong FormData
    asyncHandler(movieController.uploadMovieVideo)
);

export default router;