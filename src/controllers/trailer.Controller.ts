import { Request, Response } from "express";
import * as trailerService from "../services/trailer.Service"
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const uploadTrailer = async (req: Request, res: Response) => {
    const { movieId, title, youtubeUrl } = req.body;
    if (!movieId || !title || !youtubeUrl) throw new ApiError(400, 'movieId, title, and youtubeUrl are required');
    const trailer = await trailerService.uploadTrailer({ movieId, title, youtubeUrl });
    new SuccessResponse('Trailer uploaded successfully', trailer).send(res);
};

export const getTrailersByMovieId = async (req: Request, res: Response) => {
    const { movieId } = req.params;
    if (!movieId) throw new ApiError(400, 'movieId is required');
    const trailers = await trailerService.getTrailerByMovieId(movieId);
    new SuccessResponse('Trailers retrieved successfully', trailers).send(res);
};

export const updateTrailer = async (req: Request, res: Response) => {
    const { trailerId } = req.params;
    const { title, youtubeUrl } = req.body;
    if (!trailerId) throw new ApiError(400, 'trailerId is required');
    const updatedTrailer = await trailerService.updateTrailer(trailerId, { title, youtubeUrl });
    new SuccessResponse('Trailer updated successfully', updatedTrailer).send(res);
};

export const deleteTrailer = async (req: Request, res: Response) => {
    const { trailerId } = req.params;
    if (!trailerId) throw new ApiError(400, 'trailerId is required');
    await trailerService.deleteTrailer(trailerId);
    new SuccessResponse('Trailer deleted successfully').send(res);
};