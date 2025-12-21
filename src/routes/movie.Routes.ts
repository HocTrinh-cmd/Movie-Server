import { Router } from 'express';
import * as movieController from '../controllers/movie.Controller';

const router = Router();


router.get('/movie', movieController.getMovies);
router.get('/discover/movie', movieController.discoverMoviesController);
router.get('/trending', movieController.getMostViewedMovies);
router.get('/:id/detail', movieController.getMovieById);
router.get('/search/query', movieController.searchMovies);

// Route Admin
router.post('/add', movieController.createMovie);
router.put('/update/:id', movieController.updateMovie);

export default router;