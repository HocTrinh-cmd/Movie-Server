import { Request, Response } from "express";
import * as subtitleService from "../services/subtitle.Service"

export const uploadSubtitle = async (req: Request, res: Response) => {
    try {
        const { movieId, lang, label, fileUrl } = req.body;
        const subtitle = await subtitleService.uploadSubtitle(movieId, lang, label, fileUrl);
        res.status(200).json({ success: true, message: 'Thêm phụ đề thành công', subtitle });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getSubtitlesByMovieId = async (req: Request, res: Response) => {
    try {
        const { movieId } = req.params;
        const subtitles = await subtitleService.getSubtitlesByMovieId(movieId);
        res.status(200).json({ success: true, message: 'Lấy phụ đề thành công', subtitles });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateSubtitle = async (req: Request, res: Response) => {
    try {
        const { subtitleId } = req.params;
        const { lang, label, fileUrl } = req.body;
        const updatedSubtitle = await subtitleService.updateSubtitle(subtitleId, { lang, label, fileUrl });
        res.status(200).json({ success: true, message: 'Cập nhật phụ đề thành công', updatedSubtitle });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteSubtitle = async (req: Request, res: Response) => {
    try {
        const { subtitleId } = req.params;
        await subtitleService.deleteSubtitle(subtitleId);
        res.status(200).json({ success: true, message: 'Xoá phụ đề thành công' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};