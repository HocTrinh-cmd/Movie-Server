import { Request, Response } from "express";
import * as trailerService from "../services/trailer.Service"

export const uploadTrailer = async (req: Request, res: Response) => {
    try {
        const { movieId, title, youtubeUrl } = req.body;
        const trailer = await trailerService.uploadTrailer({ movieId, title, youtubeUrl });
        res.status(200).json({ success: true, message: 'Thêm trailer thành công', trailer });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getTrailersByMovieId = async (req: Request, res: Response) => {
    try {
        const { movieId } = req.params;
        const trailers = await trailerService.getTrailerByMovieId(movieId);
        res.status(200).json({ success: true, message: 'Lấy trailer thành công', trailers });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateTrailer = async (req: Request, res: Response) => {
    try {
        const { trailerId } = req.params;
        const { title, youtubeUrl } = req.body;
        const updatedTrailer = await trailerService.updateTrailer(trailerId, { title, youtubeUrl });
        res.status(200).json({ success: true, message: 'Cập nhật trailer thành công', updatedTrailer });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteTrailer = async (req: Request, res: Response) => {
    try {
        const { trailerId } = req.params;
        await trailerService.deleteTrailer(trailerId);
        res.status(200).json({ success: true, message: 'Xoá trailer thành công' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};