import { Router } from 'express';
import * as keywordController from '../controllers/keyword.Controller';

const router = Router();

router.get('/:title', keywordController.getKeywordsByMovieTitle);
router.get('/movies/:title', keywordController.getMoviesByKeyword);

export default router;