import { Router } from "express";
import { requireAuth } from "../middlewares/auth.Middleware";
import * as commentController from "../controllers/comment.controller";
import { asyncHandler } from "../utils/asyncHandler";


const router = Router();

router.get("/:movieId/comments", asyncHandler(commentController.getCommentsByMovieId));
router.post("/create-comment",requireAuth, asyncHandler(commentController.createComment));
router.put("/:commentId/update",requireAuth, asyncHandler(commentController.updateComment));
router.delete("/:commentId", requireAuth, asyncHandler(commentController.deleteComment));

export default router;