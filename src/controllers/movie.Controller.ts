import * as movieService from '../services/movie.Service';
import { Request, Response } from 'express';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const { page, perPage } = req.query;
    const movies = await movieService.getMovies({
      page: Number(page) || 1,
      perPage: Number(perPage) || 20,
    });
    res.status(200).json({
      page: Number(page) || 1,
      perPage: Number(perPage) || 20,
      results: movies,
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export const discoverMoviesController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;
    const genres = (req.query.genres as string)?.split(",") || [];
    const match = (req.query.match as "any" | "all") || "any";

    const result = await movieService.discoverMovies({ genres, match, page, perPage });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await movieService.getMovieDetailById(id);
    res.status(200).json(movie);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export const searchMovies = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) throw new Error("Thiếu query");
    const result = await movieService.searchMovies(String(query));
    res.status(200).json({ result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  try {
    const movie = await movieService.addMovie(req.body);
    res.status(200).json({ success: true, movie });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedMovie = await movieService.updateMovie(id, req.body);
    res.status(200).json({ success: true, movie: updatedMovie });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}