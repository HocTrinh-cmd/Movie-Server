import { Request, Response } from 'express';
import * as keywordService from '../services/keyword.Service';

export const getKeywordsByMovieTitle = async (req: Request, res: Response) => {
  try {
    const { title } = req.params;
    const movies = await keywordService.getKeywordsByMovieTitle(title);
    res.status(200).json({ results: movies });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMoviesByKeyword = async (req: Request, res: Response) => {
  try {
    const { title } = req.params;
    const movies = await keywordService.getMoviesByKeyword(title);
    res.status(200).json({ results: movies });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export const saveMovieWithKeywords = async (req: Request, res: Response) => {
  try {
    const { movieData, keywords } = req.body;
    const saveKeyword = await keywordService.saveMovieWithKeywords( movieData, keywords);
    res.status(200).json({ results: saveKeyword });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}


