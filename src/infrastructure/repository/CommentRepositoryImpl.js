import CommentRepository from '../../domain/comment/repository/CommentRepository.js';
import { comment } from '../data/comment.js';

/**
 * Comment 리포지토리 구현체
 * 댓글 도메인의 영속성을 구현합니다.
 */
class CommentRepositoryImpl extends CommentRepository {
    constructor() {
        super();
        this.comments = [];
        this.nextId = 1;
    }

    /**
     * 댓글을 생성합니다.
     * @param {Comment} comment - 생성할 댓글 엔티티
     * @returns {Promise<Comment>} 생성된 댓글
     */
    async create(commentData) {
        const newId = Math.max(...comment.map(c => c.id), 0) + 1;
        const now = new Date().toISOString();
        const newComment = {
            id: newId,
            content: commentData.content,
            user_id: commentData.user_id,
            username: commentData.username,
            department: commentData.department,
            student_id: commentData.student_id,
            artwork_id: commentData.artwork_id,
            notice_id: commentData.notice_id,
            created_at: now,
            updated_at: now
        };

        comment.push(newComment);
        return newComment;
    }

    /**
     * 댓글을 수정합니다.
     * @param {number} id - 댓글 ID
     * @param {Object} updateData - 수정할 데이터
     * @returns {Promise<Comment>} 수정된 댓글
     */
    async update(id, data) {
        const index = comment.findIndex(c => c.id === parseInt(id));
        if (index === -1) return null;

        comment[index] = {
            ...comment[index],
            content: data.content,
            updated_at: new Date().toISOString()
        };

        return comment[index];
    }

    /**
     * 댓글을 삭제합니다.
     * @param {number} id - 댓글 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(id) {
        const index = comment.findIndex(c => c.id === parseInt(id));
        if (index === -1) return false;

        comment.splice(index, 1);
        return true;
    }

    /**
     * ID로 댓글을 조회합니다.
     * @param {number} id - 댓글 ID
     * @returns {Promise<Comment>} 조회된 댓글
     */
    async findById(id) {
        const foundComment = comment.find(c => c.id === parseInt(id));
        if (!foundComment) return null;
        return {
            ...foundComment,
            user_id: foundComment.user_id,
            username: foundComment.username,
            department: foundComment.department,
            student_id: foundComment.student_id
        };
    }

    /**
     * 특정 타겟의 댓글 목록을 조회합니다.
     * @param {string} targetType - 타겟 타입
     * @param {number} targetId - 타겟 ID
     * @param {number} offset - 시작 위치
     * @param {number} limit - 조회할 개수
     * @returns {Promise<Comment[]>} 댓글 목록
     */
    async findByTarget(targetType, targetId, offset, limit) {
        return this.comments
            .filter(comment =>
                comment.targetType === targetType &&
                comment.targetId === targetId
            )
            .slice(offset, offset + limit);
    }

    /**
     * 특정 타겟의 댓글 수를 조회합니다.
     * @param {string} targetType - 타겟 타입
     * @param {number} targetId - 타겟 ID
     * @returns {Promise<number>} 댓글 수
     */
    async countByTarget(targetType, targetId) {
        return this.comments.filter(comment =>
            comment.targetType === targetType &&
            comment.targetId === targetId
        ).length;
    }

    /**
     * 특정 부모 댓글의 대댓글 목록을 조회합니다.
     * @param {number} parentId - 부모 댓글 ID
     * @returns {Promise<Comment[]>} 대댓글 목록
     */
    async findReplies(parentId) {
        return this.comments.filter(comment => comment.parent_id === parentId);
    }

    /**
     * @inheritdoc
     */
    async findByArtworkId(artworkId, { offset = 0, limit = 10 }) {
        const comments = comment
            .filter(c => c.artwork_id === parseInt(artworkId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(offset, offset + limit)
            .map(c => ({
                ...c,
                user_id: c.user_id,
                username: c.username,
                department: c.department,
                student_id: c.student_id
            }));
        return comments;
    }

    /**
     * @inheritdoc
     */
    async countByArtworkId(artworkId) {
        return comment.filter(c => c.artwork_id === parseInt(artworkId)).length;
    }

    /**
     * 공지사항 ID로 댓글을 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @param {number} offset - 시작 위치
     * @param {number} limit - 한 페이지당 댓글 수
     * @returns {Promise<Array>} 댓글 목록
     */
    async findByNoticeId(noticeId, offset = 0, limit = 10) {
        const comments = comment
            .filter(c => c.notice_id === parseInt(noticeId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(offset, offset + limit)
            .map(c => ({
                ...c,
                user_id: c.user_id,
                username: c.username,
                department: c.department,
                student_id: c.student_id
            }));
        return comments;
    }

    /**
     * 공지사항 ID로 댓글 수를 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @returns {Promise<number>} 댓글 수
     */
    async countByNoticeId(noticeId) {
        return comment.filter(c => c.notice_id === parseInt(noticeId)).length;
    }

    async deleteByNoticeId(noticeId) {
        const initialLength = comment.length;
        const remainingComments = comment.filter(c => c.notice_id !== parseInt(noticeId));
        comment.length = 0;
        comment.push(...remainingComments);
        return initialLength - comment.length;
    }
}

export default CommentRepositoryImpl;
