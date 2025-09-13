import { Request, Response } from 'express';
import * as castService from '../services/movieCast.Service';
import { casts } from '../db/schema';

export const getMoviesByActor = async (req: Request, res: Response) => {
    try {
        const { nameCast } = req.body;
        const casts = await castService.getMoviesByActor(nameCast);
        res.status(200).json({ success: true, results: casts });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getActorByid = async (req: Request, res: Response) => {
    try {
        const { castId } = req.params;
        const cast = await castService.getActorByid(castId);
        res.status(200).json({ success: true, results: cast });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const addCast = async (req: Request, res: Response) => {
    try { 
        const castData = req.body;
        const newCast = await castService.addCast(castData);
        res.status(200).json({ success: true, results: newCast });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateCast = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, profileUrl } = req.body;
        const updateCast = await castService.updateCast( id, { name, profileUrl } );
        res.status(200).json({ success: true,results: updateCast });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteCast = async ( req: Request, res: Response ) => {
    try { 
        const { id } = req.params;
        const deleteCast = castService.deleteCast(id);
        res.status(200).json({  success: true, results: deleteCast})
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}