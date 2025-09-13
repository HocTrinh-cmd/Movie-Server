import { Request, Response } from "express";
import * as historyService from "../services/history.Service"

export const upsertWatchHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { movieId, progress, duration } = req.body;
        const history = await historyService.upsertWatchHistory(userId, movieId, progress, duration);
        res.status(200).json({ success: true, message: 'Cập nhật lịch sử xem thành công', history });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getWatchHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const history = await historyService.getWatchHistory(userId);
        res.status(200).json({ success: true, message: 'Lấy lịch sử xem thành công', history });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteWatchHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { watchHistoryId } = req.params;
        await historyService.deleteWatchHistory(userId, watchHistoryId);
        res.status(200).json({ success: true, message: 'Xoá lịch sử xem thành công' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};