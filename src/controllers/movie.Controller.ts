import * as movieService from '../services/movie.Service';
import { Request, Response } from 'express';
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getMovies = async (req: Request, res: Response) => {
  const { page, perPage } = req.query;
  const pageNum = Number(page) || 1;
  const perPageNum = Number(perPage) || 20;
  const movies = await movieService.getMovies({
    page: pageNum,
    perPage: perPageNum,
  });
  new SuccessResponse('Movies retrieved successfully', {
    page: pageNum,
    perPage: perPageNum,
    results: movies,
  }).send(res);
}

export const discoverMoviesController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  const genres = (req.query.genres as string)?.split(",") || [];
  const match = (req.query.match as "any" | "all") || "any";
  const result = await movieService.discoverMovies({ genres, match, page, perPage });
  new SuccessResponse('Movies discovered successfully', result).send(res);
};

export const getMovieById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, 'id is required');
  const movie = await movieService.getMovieDetailById(id);
  new SuccessResponse('Movie retrieved successfully', movie).send(res);
}

export const searchMovies = async (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query) throw new ApiError(400, 'query is required');
  const result = await movieService.searchMovies(String(query));
  new SuccessResponse('Movies searched successfully', { result }).send(res);
};

export const getMostViewedMovies = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10; // Mặc định lấy 10 phim top đầu

    const result = await movieService.getMostViewedMovies({ page, perPage });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  const movie = await movieService.addMovie(req.body);
  new SuccessResponse('Movie created successfully', { movie }).send(res);
};

export const updateMovie = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, 'id is required');
  const updatedMovie = await movieService.updateMovie(id, req.body);
  new SuccessResponse('Movie updated successfully', { movie: updatedMovie }).send(res);
}