import * as commentService from '../services/comment.Service';
import { Request, Response } from 'express';
import { PaginationResponse, SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getCommentsByMovieId = async (req: Request, res: Response) => {
    const { movieId } = req.params;

    // Lấy page và perPage từ query params (mặc định là 1 và 10)
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    if (!movieId) throw new ApiError(400, 'movieId is required');

    // Gọi service
    const { records, totalRecords } = await commentService.getCommentsByMovieId(
        movieId,
        { page, perPage }
    );

    // Trả về Response chuẩn phân trang
    new PaginationResponse(
        'Lấy bình luận thành công',
        records,
        page,
        perPage,
        totalRecords
    ).send(res);
};

export const createComment = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { movieId, content, parentId } = req.body;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!movieId || !content) throw new ApiError(400, 'movieId and content are required');
    const newComment = await commentService.createComment(userId, movieId, content, parentId);
    new SuccessResponse('Comment created successfully', { comment: newComment }).send(res);
}

export const updateComment = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;
    const { content } = req.body;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!commentId || !content) throw new ApiError(400, 'commentId and content are required');
    const updatedComment = await commentService.updateComment(userId, commentId, content);
    new SuccessResponse('Comment updated successfully', { comment: updatedComment }).send(res);
}

export const deleteComment = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!commentId) throw new ApiError(400, 'commentId is required');
    await commentService.deleteComment(userId, commentId);
    new SuccessResponse('Comment deleted successfully').send(res);
}