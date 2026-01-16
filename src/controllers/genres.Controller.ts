import * as genresService from '../services/movieGenres.Service';
import { Request, Response } from 'express';
import { PaginationResponse, SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getAllGenres = async (req: Request, res: Response) => {
    const genres = await genresService.getAllGenres();
    new SuccessResponse('Genres retrieved successfully', { records: genres }).send(res);
};

export const getMoviesByGenreId = async (req: Request, res: Response) => {
    const genreId = req.params.id;

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;

    if (!genreId) throw new ApiError(400, 'genreId is required');
    const { movies, total, genreName } = await genresService.getMoviesByGenreId(genreId, { page, perPage });

    new PaginationResponse(
        `Movies in genre '${genreName}' retrieved successfully`,
        movies,
        page,
        perPage,
        total
    ).send(res);
}

export const addGenre = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) throw new ApiError(400, 'name is required');
    const newGenre = await genresService.addGenre({ name, description });
    new SuccessResponse('Genre added successfully', newGenre).send(res);
}

export const updateGenre = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!id) throw new ApiError(400, 'id is required');
    if (!name) throw new ApiError(400, 'name is required');
    const updatedGenre = await genresService.updateGenre(id, { name, description });
    new SuccessResponse('Genre updated successfully', updatedGenre).send(res);
}

export const deleteGenre = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, 'id is required');
    await genresService.deleteGenre(id);
    new SuccessResponse('Genre deleted successfully').send(res);
}