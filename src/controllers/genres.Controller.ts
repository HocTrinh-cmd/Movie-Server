import * as genresService from '../services/movieGenres.Service';
import { Request, Response } from 'express';
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getAllGenres = async (req: Request, res: Response) => {
    const genres = await genresService.getAllGenres();
    new SuccessResponse('Genres retrieved successfully', { genres }).send(res);
};

export const getMoviesByGenreId = async (req: Request, res: Response) => {
    const genreId = req.params.id;
    if (!genreId) throw new ApiError(400, 'genreId is required');
    const movies = await genresService.getMoviesByGenreId(genreId);
    new SuccessResponse('Movies retrieved successfully', { movies }).send(res);
}

export const addGenre = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) throw new ApiError(400, 'name is required');
    const newGenre = await genresService.addGenre({ name, description });
    new SuccessResponse('Genre added successfully', { genre: newGenre }).send(res);
}

export const updateGenre = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!id) throw new ApiError(400, 'id is required');
    if (!name) throw new ApiError(400, 'name is required');
    const updatedGenre = await genresService.updateGenre(id, { name, description });
    new SuccessResponse('Genre updated successfully', { genre: updatedGenre }).send(res);
}

export const deleteGenre = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, 'id is required');
    await genresService.deleteGenre(id);
    new SuccessResponse('Genre deleted successfully').send(res);
}