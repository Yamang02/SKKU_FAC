import CommentRepository from '../../domain/comment/repository/CommentRepository.js';
import commentsData from '../data/comment.js';

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
    async create(data) {
        const newId = Math.max(...commentsData.map(comment => comment.id)) + 1;
        const now = new Date().toISOString();
        const newComment = {
            id: newId,
            content: data.content,
            artwork_id: parseInt(data.artwork_id),
            user_id: parseInt(data.user_id),
            username: data.username,
            created_at: now,
            updated_at: now
        };

        commentsData.push(newComment);
        return newComment;
    }

    /**
     * 댓글을 수정합니다.
     * @param {number} id - 댓글 ID
     * @param {Object} updateData - 수정할 데이터
     * @returns {Promise<Comment>} 수정된 댓글
     */
    async update(id, data) {
        const index = commentsData.findIndex(comment => comment.id === parseInt(id));
        if (index === -1) return null;

        commentsData[index] = {
            ...commentsData[index],
            content: data.content,
            updated_at: new Date().toISOString()
        };

        return commentsData[index];
    }

    /**
     * 댓글을 삭제합니다.
     * @param {number} id - 댓글 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(id) {
        const index = commentsData.findIndex(comment => comment.id === parseInt(id));
        if (index === -1) return false;

        commentsData.splice(index, 1);
        return true;
    }

    /**
     * ID로 댓글을 조회합니다.
     * @param {number} id - 댓글 ID
     * @returns {Promise<Comment>} 조회된 댓글
     */
    async findById(id) {
        return this.comments.find(comment => comment.id === id);
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
    async findByArtworkId(artworkId, { limit = 10, offset = 0 }) {
        return commentsData
            .filter(comment => comment.artwork_id === parseInt(artworkId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(offset, offset + limit);
    }

    /**
     * @inheritdoc
     */
    async countByArtworkId(artworkId) {
        return commentsData.filter(comment => comment.artwork_id === parseInt(artworkId)).length;
    }

    /**
     * 공지사항 ID로 댓글을 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @param {number} limit - 한 페이지당 댓글 수
     * @param {number} offset - 시작 위치
     * @returns {Promise<Array>} 댓글 목록
     */
    async findByNoticeId(noticeId, limit, offset) {
        return commentsData
            .filter(comment => comment.notice_id === parseInt(noticeId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(offset, offset + limit);
    }

    /**
     * 공지사항 ID로 댓글 수를 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @returns {Promise<number>} 댓글 수
     */
    async countByNoticeId(noticeId) {
        return commentsData.filter(comment => comment.notice_id === parseInt(noticeId)).length;
    }
}

export default CommentRepositoryImpl;
