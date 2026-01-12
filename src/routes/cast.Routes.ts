import { Router } from "express";
import * as castController from '../controllers/cast.Controller';
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post('/actor/movies', asyncHandler(castController.getMoviesByActor));
router.get('/actor/:castId', asyncHandler(castController.getActorByid));
router.post('/add-actor', asyncHandler(castController.addCast));
router.put('/update-actor/:id', asyncHandler(castController.updateCast));
router.delete('/delete-actor/:id', asyncHandler(castController.deleteCast));
export default router;