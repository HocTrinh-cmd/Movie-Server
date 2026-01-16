import { Request, Response } from 'express';
import { PaginationResponse } from '../core/ApiResponse';
import * as recommendService from '../services/searchMovies.Service';

export const getRelatedMovies = async (req: Request, res: Response) => {
    // URL: /recommendations?q=iron&page=1
    const query = req.query.q as string;
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;

    const { movies, total, anchorMovie } = await recommendService.getRelatedMoviesBySearchQuery(query, { page, perPage });

    new PaginationResponse(
        `Found movies related to '${anchorMovie}'`, // Thông báo rõ ràng: Tìm thấy phim liên quan tới 'Iron Man'
        movies,
        page,
        perPage,
        total
    ).send(res);
};