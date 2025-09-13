import { db } from '../db/db';
import { comments } from '../db/schema';
import { eq, desc, and, isNull, asc, is } from 'drizzle-orm';

// Hàm đệ quy để flatten replies thành mảng 1 chiều
function flattenReplies(replies: any[]): any[] {
    const result: any[] = [];

    function dfs(list: any[]) { // depth-first search (tìm kiếm theo chiều sâu)
        for (const r of list) {
            result.push({
                isDeleted: r.isDeleted,
                content: r.content,
                user: r.user,
                parent: r.parent,
            });
            // Nếu reply có replies con, đệ quy tiếp
            if (r.replies && r.replies.length > 0) {
                dfs(r.replies); // đệ quy cho danh sách replies gốc
            }
        }
    }

    dfs(replies);
    return result;
}

export const getCommentByMovieId = async (movieId: string) => {
    try {
        const reviewsList = await db.query.comments.findMany({
            where: (c) => and(eq(c.movieId, movieId), isNull(c.parentId)),
            orderBy: (c) => desc(c.createdAt),
            with: {
                user: { columns: { id: true, name: true, avatarUrl: true, email: true, } },
                replies: {
                    orderBy: (r) => asc(r.createdAt),
                    columns: { content: true, isDeleted: true },
                    with: {
                        user: { columns: { id: true, name: true, avatarUrl: true, email: true, } },
                        parent: {
                            columns: { content: true, isDeleted: true },
                            with: {
                                user: { columns: { id: true, name: true, avatarUrl: true, email: true, } }
                            }
                        },
                        replies: {
                            columns: { content: true, isDeleted: true },
                            with: {
                                user: { columns: { id: true, name: true, avatarUrl: true, email: true, } },
                                parent: {
                                    columns: { content: true, isDeleted: true }
                                    , with: { user: { columns: { id: true, name: true, avatarUrl: true, email: true, } }, }
                                }
                            }
                        }
                    },
                },
            }
        });

        const formatted = reviewsList.map(c => ({
            ...c,
            replies: flattenReplies(c.replies)
        }));

        return formatted;
    } catch (error: any) {
        throw new Error('Lấy danh sách bình luận không thành công: ' + error.message);
    }
}

export const createComment = async (userId: string, movieId: string, content: string, parentId?: string) => {
    try {
        const newComment = await db.insert(comments).values({
            userId,
            movieId,
            content,
            parentId: parentId || null,
        }).returning();

        return newComment;
    } catch (error: any) {
        throw new Error('Tạo bình luận không thành công: ' + error.message);
    }
}

export const updateComment = async (userId: string, commentId: string, content: string) => {
    try {
        const comment = await db.query.comments.findFirst({
            where: (c) => eq(c.id, commentId),
        });

        if (!comment) throw new Error('Bình luận không tồn tại');

        if (comment.userId !== userId) throw new Error('Bạn không có quyền cập nhật bình luận này');

        const updatedComment = await db.update(comments).set({
            content,
            updatedAt: new Date(),
        }).where(eq(comments.id, commentId)).returning();

        return updatedComment;
    } catch (error: any) {
        throw new Error('Cập nhật bình luận không thành công: ' + error.message);
    }
}

export const deleteComment = async (userId: string, commentId: string) => {
    try {
        const comment = await db.query.comments.findFirst({
            where: (c) => eq(c.id, commentId),
        });

        if (!comment) throw new Error('Bình luận không tồn tại');

        if (comment.userId !== userId) throw new Error('Bạn không có quyền xóa bình luận này');

        const deleteComment = await db.update(comments).set({
            isDeleted: true, deletedAt: new Date()
        })
        .where(eq(comments.id, commentId));

        return deleteComment;
    } catch (error: any) {
        throw new Error('Xoá bình luận không thành công: ' + error.message);
    }
}