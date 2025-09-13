import { Request, Response } from "express";
import * as ratingService from "../services/rating.Service"

export const rateMovie = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { movieId, score } = req.body;
        const rating = await ratingService.addOrUpdateRating(userId, movieId, score);
        res.status(200).json({ success: true, message: 'Đánh giá phim thành công', rating });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getRatings = async (req: Request, res: Response) => {
    try {
        const movieId = req.query.movieId as string;
        const ratings = await ratingService.getRatingsByMovieId(movieId);
        res.status(200).json({ success: true, message: 'Lấy đánh giá thành công', ratings });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }   
};