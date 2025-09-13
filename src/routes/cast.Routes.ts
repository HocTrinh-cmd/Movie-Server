import { Router } from "express";
import * as castController from '../controllers/cast.Controller';

const router = Router();

router.post('/actor/movies', castController.getMoviesByActor);
router.get('/actor/:castId', castController.getActorByid);
router.post('/add-actor', castController.addCast);
router.put('/update-actor/:id', castController.updateCast);
router.delete('/delete-actor/:id', castController.deleteCast);

export default router;