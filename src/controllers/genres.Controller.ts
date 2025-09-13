import * as genresService from '../services/movieGenres.Service';
import { Request, Response } from 'express';

export const getAllGenres = async (req: Request, res: Response) => {
    try {
        const genres = await genresService.getAllGenres();
        res.status(200).json({ message: 'lấy danh sách thành công', genres });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getMoviesByGenreId = async (req: Request, res: Response) => {
    try {
        const genreId = req.params.id;
        const movies = await genresService.getMoviesByGenreId(genreId);
        res.status(200).json({ success: true, movies });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const addGenre = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const newGenre = await genresService.addGenre({ name, description });
        res.status(200).json({ success: true, message: 'Thêm thành công', genre: newGenre });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateGenre = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedGenre = await genresService.updateGenre(id, { name, description });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', genre: updatedGenre });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteGenre = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await genresService.deleteGenre(id);
        res.status(200).json({ success: true, message: 'Xóa thể loại thành công' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}