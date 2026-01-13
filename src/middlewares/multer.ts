import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục tạm nếu chưa có
const uploadDir = 'uploads_temp/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Cấu hình lưu file tạm vào ổ cứng
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Đặt tên file tạm
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

export const uploadVideoMiddleware = multer({
    storage: diskStorage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // Giới hạn 2GB (tùy chỉnh)
});