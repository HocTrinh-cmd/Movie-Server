import { Request, Response } from "express";
import * as historyService from "../services/history.Service"
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const upsertWatchHistory = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { movieId, progress, duration } = req.body;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!movieId) throw new ApiError(400, 'movieId is required');
    const history = await historyService.upsertWatchHistory(userId, movieId, progress, duration);
    new SuccessResponse('Watch history updated successfully', { history }).send(res);
};

export const getWatchHistory = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const history = await historyService.getWatchHistory(userId);
    new SuccessResponse('Watch history retrieved successfully', { history }).send(res);
};

export const deleteWatchHistory = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { watchHistoryId } = req.params;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!watchHistoryId) throw new ApiError(400, 'watchHistoryId is required');
    await historyService.deleteWatchHistory(userId, watchHistoryId);
    new SuccessResponse('Watch history deleted successfully').send(res);
};