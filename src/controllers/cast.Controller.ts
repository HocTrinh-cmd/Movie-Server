import { Request, Response } from 'express';
import * as castService from '../services/movieCast.Service';
import { casts } from '../db/schema';
import { SuccessResponse } from '../core/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getMoviesByActor = async (req: Request, res: Response) => {
    const { nameCast } = req.body;
    if (!nameCast) throw new ApiError(400, 'nameCast is required');
    const casts = await castService.getMoviesByActor(nameCast);
    new SuccessResponse('Movies retrieved successfully', casts).send(res);
}

export const getActorByid = async (req: Request, res: Response) => {
    const { castId } = req.params;
    if (!castId) throw new ApiError(400, 'castId is required');
    const cast = await castService.getActorByid(castId);
    new SuccessResponse('Actor retrieved successfully', cast).send(res);
}

export const addCast = async (req: Request, res: Response) => {
    const castData = req.body;
    if (!castData || !castData.name) throw new ApiError(400, 'Cast data with name is required');
    const newCast = await castService.addCast(castData);
    new SuccessResponse('Cast added successfully', newCast).send(res);
}

export const updateCast = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, profileUrl } = req.body;
    if (!id) throw new ApiError(400, 'id is required');
    const updatedCast = await castService.updateCast(id, { name, profileUrl });
    new SuccessResponse('Cast updated successfully', updatedCast).send(res);
}

export const deleteCast = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, 'id is required');
    const deletedCast = await castService.deleteCast(id);
    new SuccessResponse('Cast deleted successfully', deletedCast).send(res);
}