import { Request, Response } from 'express';
import * as keywordService from '../services/keyword.Service';
import { PaginationResponse, SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getKeywordsByMovieTitle = async (req: Request, res: Response) => {
  const { title } = req.params;
  if (!title) throw new ApiError(400, 'title is required');
  const movies = await keywordService.getKeywordsByMovieTitle(title);
  new SuccessResponse('Keywords retrieved successfully', movies).send(res);
};


export const saveMovieWithKeywords = async (req: Request, res: Response) => {
  const { movieData, keywords } = req.body;
  if (!movieData || !keywords) throw new ApiError(400, 'movieData and keywords are required');
  const saveKeyword = await keywordService.saveMovieWithKeywords(movieData, keywords);
  new SuccessResponse('Movie with keywords saved successfully', { results: saveKeyword }).send(res);
}


