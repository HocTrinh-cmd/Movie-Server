import * as commnetService from '../services/comment.Service';
import { Request, Response } from 'express';

export const getCommnetsByMovieId = async (req: Request, res: Response) => {
    try {
        const { movieId } = req.params;

        const comments = await commnetService.getCommentByMovieId(movieId);

        res.status(200).json({ success: true, comments });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const createComment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { movieId, content, parentId } = req.body;

        const newComment = await commnetService.createComment(userId, movieId, content, parentId);

        res.status(200).json({ success: true, message: 'Tạo đánh giá thành công', comment: newComment });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateComment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { commentId } = req.params;
        const { content } = req.body;

        const updatedComment = await commnetService.updateComment(userId, commentId, content);

        res.status(200).json({ success: true, message: 'Cập nhật đánh giá thành công', comment: updatedComment });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { commentId } = req.params;

        await commnetService.deleteComment(userId, commentId);

        res.status(200).json({ success: true, message: 'Xoá đánh giá thành công' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}