import { db } from '../db/db';
import { comments } from '../db/schema';
import { eq, desc, and, asc, isNull, count } from 'drizzle-orm';
import { ApiError } from '../utils/ApiError';

// Helper: Làm phẳng mảng replies (Flatten)
// Lưu ý: Drizzle trả về object lồng nhau rất sâu, ta dùng đệ quy để gom lại thành 1 mảng phẳng
const flattenReplies = (replies: any[]): any[] => {
    const result: any[] = [];

    const dfs = (list: any[]) => {
        for (const r of list) {
            result.push({
                id: r.id,
                content: r.content,
                isDeleted: r.isDeleted,
                createdAt: r.createdAt,
                user: r.user,
                parent: r.parent, // Để biết đang reply ai
            });

            // Nếu có replies con (cấp 3, cấp 4...), đệ quy tiếp
            if (r.replies && r.replies.length > 0) {
                dfs(r.replies);
            }
        }
    };

    dfs(replies);
    return result;
};

export const getCommentsByMovieId = async (
    movieId: string,
    { page = 1, perPage = 10 }: { page?: number, perPage?: number }
) => {
    if (!movieId) throw new ApiError(400, "MovieId is required");

    const limit = Number(perPage);
    const offset = (Number(page) - 1) * limit;

    // 1. Lấy danh sách Root Comments (có phân trang)
    const rootComments = await db.query.comments.findMany({
        where: (c) => and(eq(c.movieId, movieId), isNull(c.parentId)), // Chỉ lấy comment gốc
        limit: limit,  
        offset: offset, 
        orderBy: (c) => desc(c.createdAt),
        with: {
            user: { columns: { id: true, name: true, avatarUrl: true, email: true } },
            // Query lồng nhau giữ nguyên như cũ
            replies: {
                orderBy: (r) => asc(r.createdAt),
                with: {
                    user: { columns: { id: true, name: true, avatarUrl: true, email: true } },
                    parent: { with: { user: { columns: { name: true } } } }, // Lấy tên người được reply
                    replies: {
                        with: {
                            user: { columns: { id: true, name: true, avatarUrl: true, email: true } },
                            parent: { with: { user: { columns: { name: true } } } },
                            replies: {
                                with: {
                                    user: { columns: { id: true, name: true, avatarUrl: true, email: true } },
                                    parent: { with: { user: { columns: { name: true } } } },
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // 2. Đếm tổng số lượng Root Comments (để tính Total Pages)
    const totalResult = await db
        .select({ value: count() })
        .from(comments)
        .where(and(eq(comments.movieId, movieId), isNull(comments.parentId)));

    const totalRecords = totalResult[0].value;

    // 3. Xử lý làm phẳng replies cho từng comment gốc
    const formattedRecords = rootComments.map(c => ({
        ...c,
        replies: flattenReplies(c.replies) // Gom replies 3 cấp thành 1 mảng phẳng
    }));

    // Trả về đủ dữ liệu cho PaginationResponse
    return {
        records: formattedRecords,
        totalRecords,
        page,
        perPage
    };
};

export const createComment = async (userId: string, movieId: string, content: string, parentId?: string) => {
    if (!content || content.trim() === '') {
        throw new ApiError(400, "Content cannot be empty");
    }

    const [newComment] = await db.insert(comments).values({
        userId,
        movieId,
        content,
        parentId: parentId || null,
    }).returning();

    return newComment;
};

export const updateComment = async (userId: string, commentId: string, content: string) => {
    if (!content || content.trim() === '') {
        throw new ApiError(400, "Content cannot be empty");
    }

    const comment = await db.query.comments.findFirst({
        where: (c) => eq(c.id, commentId),
    });

    if (!comment) throw new ApiError(404, 'Comment not found');
    if (comment.userId !== userId) throw new ApiError(403, 'You do not have permission to update this comment');
    if (comment.isDeleted) throw new ApiError(400, 'Cannot update a deleted comment');

    const [updatedComment] = await db.update(comments)
        .set({
            content,
            updatedAt: new Date(),
        })
        .where(eq(comments.id, commentId))
        .returning();

    return updatedComment;
};

export const deleteComment = async (userId: string, commentId: string) => {
    const comment = await db.query.comments.findFirst({
        where: (c) => eq(c.id, commentId),
    });

    if (!comment) throw new ApiError(404, 'Comment not found');
    if (comment.userId !== userId) throw new ApiError(403, 'You do not have permission to delete this comment');
    if (comment.isDeleted) throw new ApiError(400, 'Comment is already deleted');

    const [deletedComment] = await db.update(comments)
        .set({
            isDeleted: true,
            deletedAt: new Date()
        })
        .where(eq(comments.id, commentId))
        .returning();

    return deletedComment;
};