import { Request, Response } from "express";
import * as favoriteService from "../services/favorite.Service"
import { PaginationResponse, SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getFavorites = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const { records, totalRecords } = await favoriteService.getFavoriteMovies(userId, { page, perPage });

    new PaginationResponse(
        "Favorites retrieved successfully",
        records,
        page,
        perPage,
        totalRecords
    ).send(res);
};

export const checkIsFavorite = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { movieId } = req.params;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const isFav = await favoriteService.isFavorite(userId, movieId);

    new SuccessResponse("Check favorite status", { isFavorite: isFav }).send(res);
};

export const toggleFavorite = async (req: Request, res: Response) => {
    // Lấy userId từ token (được middleware decode gán vào req.user)
    const userId = req.user?.userId;
    const { movieId } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");
    if (!movieId) throw new ApiError(400, "Movie ID is required");

    const result = await favoriteService.toggleFavoriteMovie(userId, movieId);

    // Trả về kết quả (status: added hoặc removed)
    new SuccessResponse(result.message, result).send(res);
};