import { Request, Response } from "express";
import * as subtitleService from "../services/subtitle.Service"
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const uploadSubtitle = async (req: Request, res: Response) => {
    const { movieId, lang, label, fileUrl } = req.body;
    if (!movieId || !lang || !label || !fileUrl) throw new ApiError(400, 'movieId, lang, label, and fileUrl are required');
    const subtitle = await subtitleService.uploadSubtitle(movieId, lang, label, fileUrl);
    new SuccessResponse('Subtitle uploaded successfully', { subtitle }).send(res);
};

export const getSubtitlesByMovieId = async (req: Request, res: Response) => {
    const { movieId } = req.params;
    if (!movieId) throw new ApiError(400, 'movieId is required');
    const subtitles = await subtitleService.getSubtitlesByMovieId(movieId);
    new SuccessResponse('Subtitles retrieved successfully', { subtitles }).send(res);
};

export const updateSubtitle = async (req: Request, res: Response) => {
    const { subtitleId } = req.params;
    const { lang, label, fileUrl } = req.body;
    if (!subtitleId) throw new ApiError(400, 'subtitleId is required');
    const updatedSubtitle = await subtitleService.updateSubtitle(subtitleId, { lang, label, fileUrl });
    new SuccessResponse('Subtitle updated successfully', { updatedSubtitle }).send(res);
};

export const deleteSubtitle = async (req: Request, res: Response) => {
    const { subtitleId } = req.params;
    if (!subtitleId) throw new ApiError(400, 'subtitleId is required');
    await subtitleService.deleteSubtitle(subtitleId);
    new SuccessResponse('Subtitle deleted successfully').send(res);
};