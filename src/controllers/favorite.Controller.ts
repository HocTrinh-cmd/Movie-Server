import { Request, Response } from "express";
import * as favoriteService from "../services/favorite.Service"

export const getFavoriteMovie = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const getFavoriteMovie = await favoriteService.getFavoriteMovie(userId);
        res.status(200).json({ success: true, message: 'Lấy danh sách thành công', Movies: getFavoriteMovie });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error });
    }
};

export const isFavorite = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const movieId = req.query.movieId as string;
        const isFav = await favoriteService.isFavorite(userId, movieId);
        res.status(200).json({ success: true, isFavorite: isFav });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error });
    }
};

export const toggleFavoriteMovie = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const movieId = req.query.movieId as string;
        const result = await favoriteService.toggleFavoriteMovie(userId, movieId);
        res.status(200).json({ success: true, ...result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error });
    }
};