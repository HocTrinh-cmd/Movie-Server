import * as movieService from '../services/movie.Service';
import { Request, Response } from 'express';
import { PaginationResponse, SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getMovies = async (req: Request, res: Response) => {
  const { page, perPage } = req.query;
  const pageNum = Number(page) || 1;
  const perPageNum = Number(perPage) || 20;
  const { records, totalRecords } = await movieService.getMovies({
    page: pageNum,
    perPage: perPageNum,
  });
  new PaginationResponse(
    'Movies retrieved successfully',
    records,
    pageNum,
    perPageNum,
    totalRecords
  ).send(res);
}

export const discoverMoviesController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  const genres = (req.query.genres as string)?.split(",") || [];
  const match = (req.query.match as "any" | "all") || "any";

  // Gọi service (giờ đã trả về đủ records và totalRecords)
  const { records, totalRecords } = await movieService.discoverMovies({
    genres, match, page, perPage
  });

  // Dùng PaginationResponse
  new PaginationResponse(
    'Movies discovered successfully',
    records,
    page,
    perPage,
    totalRecords
  ).send(res);
};

export const getMostViewedMovies = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 10;

  const records = await movieService.getMostViewedMovies(perPage);

  // Dùng PaginationResponse
  new SuccessResponse(
    'Most viewed movies retrieved successfully',
    records,
  ).send(res);
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

export const uploadMovieVideo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file; // File này bây giờ có thuộc tính .path

  if (!file) throw new ApiError(400, "Video file is required");

  // Gọi service
  // Lưu ý: file ở đây là từ diskStorage, nên file.path sẽ là đường dẫn thực: "uploads_temp/12345.mp4"
  const updatedMovie = await movieService.uploadMovieVideo(id, file);

  new SuccessResponse('Video uploaded successfully', updatedMovie).send(res);
};