import { bucket } from "../db/firebase";
import { ApiError } from "../utils/ApiError";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

/**
 * Upload một file lên Firebase Storage và trả về URL
 * @param fileBuffer : Dữ liệu file (Buffer)
 * @param folder : Thư mục trên Firebase (vd: 'subtitles', 'posters')
 * @param originalName : Tên file gốc (để lấy đuôi file)
 * @param mimeType : Loại file (vd: 'text/vtt', 'image/jpeg')
 */
export const uploadFileToFirebase = async (
  fileBuffer: Buffer, 
  folder: string, 
  originalName: string, 
  mimeType: string
): Promise<string> => {
  if (!fileBuffer) {
    throw new ApiError(400, "File content is empty");
  }

  // Tạo tên file ngẫu nhiên để tránh trùng: uuid + đuôi file gốc
  const fileExtension = path.extname(originalName);
  const fileName = `${folder}/${uuidv4()}${fileExtension}`;
  
  const blob = bucket.file(fileName);

  // Upload file
  await blob.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
    },
    resumable: false, // Upload nhanh cho file nhỏ
  });

  // Lấy Signed URL (URL có chữ ký bảo mật)
  // action: 'read' -> cho phép đọc
  // expires: Thời gian hết hạn (VD: set xa tít tắp 10 năm hoặc 100 năm nếu muốn public lâu dài)
  const [url] = await blob.getSignedUrl({
    action: 'read',
    expires: '01-01-2030', 
  });

  return url;
};

/**
 * Upload file lớn từ đường dẫn nội bộ (Disk) lên Firebase
 * Dùng cho Video/Movie để tránh tràn RAM
 */
export const uploadLocalFileToFirebase = async (
  localFilePath: string, 
  folder: string, 
  originalName: string, 
  mimeType: string
): Promise<string> => {
  if (!localFilePath) {
    throw new ApiError(400, "Local file path is missing");
  }

  // Tạo tên file unique
  const fileExtension = path.extname(originalName);
  const fileName = `${folder}/${uuidv4()}${fileExtension}`;
  const blob = bucket.file(fileName);

  try {
    // Firebase Admin SDK hỗ trợ upload file lớn từ đường dẫn rất tốt
    await bucket.upload(localFilePath, {
      destination: fileName,
      metadata: {
        contentType: mimeType,
      },
      resumable: true, // Bật tính năng upload nối tiếp (quan trọng cho file to)
    });

    // Lấy Signed URL (Hạn 10 năm)
    const [url] = await blob.getSignedUrl({
      action: 'read',
      expires: '01-01-2035', 
    });

    return url;
  } catch (error) {
    console.error("Firebase Upload Error:", error);
    throw new ApiError(500, "Failed to upload video to storage");
  } finally {
    // QUAN TRỌNG: Luôn xóa file tạm trên server sau khi xử lý xong (dù thành công hay thất bại)
    // Để tránh đầy ổ cứng server
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath); 
    }
  }
};

/**
 * Xóa file trên Firebase (Dùng khi xóa subtitle hoặc update file mới)
 * @param fileUrl : URL của file cần xóa
 */
export const deleteFileFromFirebase = async (fileUrl: string) => {
  if (!fileUrl) return;

  try {
    // Logic để trích xuất path từ URL (Hơi phức tạp vì URL chứa query params)
    // Cách đơn giản nhất: Lưu filePath vào DB thay vì URL. 
    // Nhưng nếu lỡ lưu URL rồi thì ta cần parse nó.
    // VD URL: https://storage.googleapis.com/.../subtitles%2Fabc.vtt?...
    
    const decodedUrl = decodeURIComponent(fileUrl);
    const baseUrl = `https://storage.googleapis.com/${bucket.name}/`;
    
    if (decodedUrl.startsWith(baseUrl)) {
      // Lấy phần path sau domain, bỏ query params
      let filePath = decodedUrl.replace(baseUrl, '');
      const questionMarkIndex = filePath.indexOf('?');
      if (questionMarkIndex !== -1) {
        filePath = filePath.substring(0, questionMarkIndex);
      }
      
      const file = bucket.file(filePath);
      await file.delete();
    }
  } catch (error) {
    console.error("Error deleting file from Firebase:", error);
    // Không throw lỗi ở đây để tránh chặn luồng chính
  }
};