import * as commnetService from '../services/comment.Service';
import { Request, Response } from 'express';
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getCommnetsByMovieId = async (req: Request, res: Response) => {
    const { movieId } = req.params;
    if (!movieId) throw new ApiError(400, 'movieId is required');
    const comments = await commnetService.getCommentByMovieId(movieId);
    new SuccessResponse('Comments retrieved successfully', { comments }).send(res);
}

export const createComment = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { movieId, content, parentId } = req.body;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!movieId || !content) throw new ApiError(400, 'movieId and content are required');
    const newComment = await commnetService.createComment(userId, movieId, content, parentId);
    new SuccessResponse('Comment created successfully', { comment: newComment }).send(res);
}

export const updateComment = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;
    const { content } = req.body;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!commentId || !content) throw new ApiError(400, 'commentId and content are required');
    const updatedComment = await commnetService.updateComment(userId, commentId, content);
    new SuccessResponse('Comment updated successfully', { comment: updatedComment }).send(res);
}

export const deleteComment = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!commentId) throw new ApiError(400, 'commentId is required');
    await commnetService.deleteComment(userId, commentId);
    new SuccessResponse('Comment deleted successfully').send(res);
}