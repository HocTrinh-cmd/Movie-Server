import { Router } from 'express';
import * as keywordController from '../controllers/keyword.Controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/:title', asyncHandler(keywordController.getKeywordsByMovieTitle));

export default router;