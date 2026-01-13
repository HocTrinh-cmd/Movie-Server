import { db } from '../db/db';
import { movieCasts, casts } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';
import { ApiError } from '../utils/ApiError';

export const getMoviesByActor = async (nameCast: string) => {
  if (!nameCast) {
    throw new ApiError(400, "Actor name is required");
  }

  const result = await db.query.casts.findMany({
    where: ilike(casts.name, `%${nameCast}%`),
    with: {
      movieCast: {
        with: {
          movie: true
        }
      },
    },
  });

  return result;
};

// Sửa tên hàm cho chuẩn camelCase: getActorByid -> getCastById
export const getCastById = async (castId: string) => {
  if (!castId) throw new ApiError(400, "Cast ID is required");

  const result = await db.query.casts.findFirst({
    where: eq(casts.id, castId),
  });

  if (!result) throw new ApiError(404, "Cast not found");
  
  return result;
}

export const addCast = async (castData: typeof casts.$inferInsert) => {
  if (!castData.name) throw new ApiError(400, "Cast name is required");

  // Check trùng tên
  const exist = await db.query.casts.findFirst({
    where: eq(casts.name, castData.name),
  })
  
  if (exist) throw new ApiError(409, 'Cast already exists');

  const result = await db.insert(casts).values(castData).returning();
  return result[0];
}

export const updateCast = async (id: string, castData: Partial<typeof casts.$inferInsert>) => {
  if (!id) throw new ApiError(400, "Cast ID is required");

  // Tối ưu: Update trực tiếp và kiểm tra kết quả trả về
  // Không cần findFirst trước để check tồn tại -> Tiết kiệm 1 query
  const [updatedCast] = await db.update(casts)
    .set(castData) // Drizzle tự động bỏ qua các field undefined
    .where(eq(casts.id, id))
    .returning();

  if (!updatedCast) {
    throw new ApiError(404, 'Cast not found to update');
  }

  return updatedCast;
}

export const deleteCast = async (id: string) => {
  if (!id) throw new ApiError(400, "Cast ID is required");

  // 1. Kiểm tra xem diễn viên có đang đóng phim nào không (Ràng buộc khóa ngoại)
  const linkedMovies = await db.query.movieCasts.findFirst({
    where: eq(movieCasts.castId, id),
  });

  if (linkedMovies) {
    throw new ApiError(400, 'Cannot delete cast. This actor is linked to existing movies.');
  }

  // 2. Thực hiện xóa
  const [deletedCast] = await db.delete(casts)
    .where(eq(casts.id, id))
    .returning();
    
  if (!deletedCast) {
    throw new ApiError(404, 'Cast not found to delete');
  }

  return deletedCast;
}