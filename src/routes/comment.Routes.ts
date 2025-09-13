import { Router } from "express";
import { requireAuth } from "../middleware/auth.Middleware";
import * as commentController from "../controllers/comment.controller";


const router = Router();

router.get("/:movieId/comments", commentController.getCommnetsByMovieId);
router.post("/create-comment",requireAuth as any, commentController.createComment);
router.put("/:commentId/update",requireAuth as any, commentController.updateComment);
router.put("/:commentId/delete",requireAuth as any, commentController.deleteComment);

export default router;