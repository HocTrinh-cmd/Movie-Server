import { Request, Response } from "express";
import * as favoriteService from "../services/favorite.Service"
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getFavoriteMovie = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const favoriteMovies = await favoriteService.getFavoriteMovie(userId);
    new SuccessResponse('Favorite movies retrieved successfully', { Movies: favoriteMovies }).send(res);
};

export const isFavorite = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const movieId = req.query.movieId as string;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!movieId) throw new ApiError(400, 'movieId is required');
    const isFav = await favoriteService.isFavorite(userId, movieId);
    new SuccessResponse('Favorite status checked', { isFavorite: isFav }).send(res);
};

export const toggleFavoriteMovie = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const movieId = req.query.movieId as string;
    if (!userId) throw new ApiError(401, 'Unauthorized');
    if (!movieId) throw new ApiError(400, 'movieId is required');
    const result = await favoriteService.toggleFavoriteMovie(userId, movieId);
    new SuccessResponse('Favorite toggled successfully', result).send(res);
};