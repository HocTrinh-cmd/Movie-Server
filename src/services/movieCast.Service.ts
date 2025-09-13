import { db } from '../db/db';
import { movies, movieCasts, casts } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';

export const getMoviesByActor = async (nameCast: string) => {
  try {
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
  } catch (error: any) {
    throw new Error('Lấy phim theo diễn viên không thành công: ' + error.message);
  }
};

export const getActorByid = async (castId: string) => {
  try {
    const result = await db.query.casts.findFirst({
      where: eq(casts.id, castId),
    });
    return result;
  } catch (error: any) {
    throw new Error('Lấy phim theo id không thành công: ' + error.message);
  }
}

export const addCast = async (castData: typeof casts.$inferInsert) => {
  try {
    const exist = await db.query.casts.findFirst({
      where: eq(casts.name, castData.name),
    })
    if (exist) throw new Error('Diễn viên đã tồn tại');
    const result = await db.insert(casts).values(castData).returning();
    return result[0];
  } catch (error: any) {
    throw new Error('Thêm diễn viên không thành công: ' + error.message);
  }
}

export const updateCast = async (id: string, castData: Partial<typeof casts.$inferInsert>) => {
  try {
    const exist = await db.query.casts.findFirst({
      where: eq(casts.id, id),
    });
    if (!exist) throw new Error('Diễn viên không tồn tại');
    const updateCast = await db.update(casts)
      .set({
        ...(castData.name ? { name: castData.name } : {}),
        ...(castData.profileUrl !== undefined ? { profileUrl: castData.profileUrl } : {})
      })
      .where(eq(casts.id, id))
      .returning();
    return updateCast[0];
  } catch (error: any) {
    throw new Error('Cập nhật diễn viên không thành công: ' + error.message);
  }
}

export const deleteCast = async (id: string) => {
  try {
    const exist = await db.query.casts.findFirst({
      where: eq(casts.id, id),
    });
    if (!exist) throw new Error('Diễn viên không tồn tại');
    const linkedMovies = await db.query.movieCasts.findFirst({
      where: eq(movieCasts.castId, id),
    });
    if (linkedMovies) throw new Error('Diễn viên đang được liên kết với phim, không thể xóa');
    return await db.delete(casts).where(eq(casts.id, id)).returning();
  } catch (error: any) {
    throw new Error('Xóa diễn viên không thành công: ' + error.message);
  }
}