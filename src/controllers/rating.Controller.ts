import { Request, Response } from "express";
import * as ratingService from "../services/rating.Service"
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const rateMovie = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { movieId, score } = req.body;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!movieId || score === undefined) throw new ApiError(400, 'movieId and score are required');
    const rating = await ratingService.addOrUpdateRating(userId, movieId, score);
    new SuccessResponse('Movie rated successfully', { rating }).send(res);
};

export const getRatings = async (req: Request, res: Response) => {
    const movieId = req.query.movieId as string;
    if (!movieId) throw new ApiError(400, 'movieId is required');
    const ratings = await ratingService.getRatingsByMovieId(movieId);
    new SuccessResponse('Ratings retrieved successfully', { ratings }).send(res);
};