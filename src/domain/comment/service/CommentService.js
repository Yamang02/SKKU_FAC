import Comment from '../entity/Comment.js';
import CommentDTO from '../dto/CommentDTO.js';
import CommentRepositoryImpl from '../../../infrastructure/repository/CommentRepositoryImpl.js';

/**
 * Comment 서비스
 * 댓글 관련 도메인 로직을 처리합니다.
 */
class CommentService {
    constructor() {
        this.commentRepository = new CommentRepositoryImpl();
    }

    /**
     * 댓글 내용의 유효성을 검사합니다.
     * @param {string} content - 댓글 내용
     * @returns {boolean} 유효성 검사 결과
     */
    validateContent(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        const trimmedContent = content.trim();
        return trimmedContent.length >= 1 && trimmedContent.length <= 1000;
    }

    /**
     * 타겟 타입의 유효성을 검사합니다.
     * @param {string} targetType - 타겟 타입
     * @returns {boolean} 유효성 검사 결과
     */
    validateTargetType(targetType) {
        const validTypes = ['notice', 'artwork'];
        return validTypes.includes(targetType);
    }

    /**
     * 페이지네이션 파라미터의 유효성을 검사합니다.
     * @param {number} page - 페이지 번호
     * @param {number} limit - 페이지당 항목 수
     * @returns {boolean} 유효성 검사 결과
     */
    validatePagination(page, limit) {
        return (
            Number.isInteger(page) &&
            Number.isInteger(limit) &&
            page > 0 &&
            limit > 0 &&
            limit <= 100
        );
    }

    /**
     * 댓글 작성자의 유효성을 검사합니다.
     * @param {string} author - 작성자
     * @returns {boolean} 유효성 검사 결과
     */
    validateAuthor(author) {
        return author && typeof author === 'string' && author.length > 0;
    }

    /**
     * 대댓글 작성 가능 여부를 검사합니다.
     * @param {Comment} parentComment - 부모 댓글
     * @returns {boolean} 작성 가능 여부
     */
    canCreateReply(parentComment) {
        return parentComment && !parentComment.is_deleted && !parentComment.isReply();
    }

    /**
     * 댓글 수정/삭제 권한을 확인합니다.
     * @param {Comment} comment - 댓글
     * @param {string} userId - 사용자 ID
     * @returns {boolean} 권한 여부
     */
    hasPermission(comment, userId) {
        return comment && !comment.is_deleted && comment.isOwnedBy(userId);
    }

    async getCommentsByNoticeId(noticeId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const comments = await this.commentRepository.findByNoticeId(noticeId, offset, limit);
        const totalCount = await this.commentRepository.countByNoticeId(noticeId);

        const totalPages = Math.ceil(totalCount / limit);
        const validPage = Math.max(1, Math.min(page, totalPages || 1));

        const startPage = Math.max(1, validPage - 1);
        const endPage = Math.min(totalPages, startPage + 2);

        return {
            comments: comments.map(c => new CommentDTO(new Comment(c))),
            pagination: {
                currentPage: validPage,
                totalPages,
                totalComments: totalCount,
                hasNextPage: validPage < totalPages,
                hasPrevPage: validPage > 1,
                startPage,
                endPage,
                showFirstPage: startPage > 1,
                showLastPage: endPage < totalPages,
                showFirstEllipsis: startPage > 2,
                showLastEllipsis: endPage < totalPages - 1,
                pages: Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
            }
        };
    }

    async deleteAllByNoticeId(noticeId) {
        return this.commentRepository.deleteByNoticeId(noticeId);
    }

    /**
     * 작품 ID에 해당하는 댓글 목록을 가져옵니다.
     * @param {number} artworkId 작품 ID
     * @param {number} page 페이지 번호 (1부터 시작)
     * @param {number} pageSize 페이지당 댓글 수
     * @returns {Object} 댓글 목록과 페이지네이션 정보
     */
    async getCommentsByArtworkId(artworkId, page = 1, pageSize = 6) {
        const offset = (page - 1) * pageSize;
        const comments = await this.commentRepository.findByArtworkId(artworkId, { offset, limit: pageSize });
        const totalCount = await this.commentRepository.countByArtworkId(artworkId);

        const totalPages = Math.ceil(totalCount / pageSize);
        const validPage = Math.max(1, Math.min(page, totalPages || 1));

        const startPage = Math.max(1, validPage - 1);
        const endPage = Math.min(totalPages, startPage + 2);

        return {
            comments: comments.map(c => new CommentDTO(new Comment(c))),
            pagination: {
                currentPage: validPage,
                totalPages,
                totalComments: totalCount,
                hasNextPage: validPage < totalPages,
                hasPrevPage: validPage > 1,
                startPage,
                endPage,
                showFirstPage: startPage > 1,
                showLastPage: endPage < totalPages,
                showFirstEllipsis: startPage > 2,
                showLastEllipsis: endPage < totalPages - 1,
                pages: Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
            }
        };
    }

    /**
     * 댓글을 추가합니다.
     * @param {Object} commentData 댓글 데이터
     * @returns {CommentDTO} 추가된 댓글 DTO
     */
    async addComment(commentData) {
        if (!this.validateContent(commentData.content)) {
            throw new Error('Invalid comment content');
        }

        if (!this.validateAuthor(commentData.author)) {
            throw new Error('Invalid author');
        }

        const newCommentData = {
            content: commentData.content,
            user_id: commentData.user_id,
            username: commentData.author,
            department: commentData.department,
            student_id: commentData.student_id,
            artwork_id: commentData.artwork_id,
            notice_id: commentData.notice_id
        };

        const newComment = await this.commentRepository.create(newCommentData);
        return new CommentDTO(new Comment(newComment));
    }

    /**
     * 댓글을 수정합니다.
     * @param {number} commentId 댓글 ID
     * @param {Object} commentData 수정할 댓글 데이터
     * @returns {CommentDTO|null} 수정된 댓글 DTO 또는 null
     */
    async updateComment(commentId, commentData, userId) {
        if (!this.validateContent(commentData.content)) {
            throw new Error('Invalid comment content');
        }

        const existingComment = await this.commentRepository.findById(commentId);
        if (!this.hasPermission(existingComment, userId)) {
            throw new Error('Permission denied');
        }

        const updatedComment = await this.commentRepository.update(commentId, commentData);
        return new CommentDTO(new Comment(updatedComment));
    }

    /**
     * 댓글을 삭제합니다.
     * @param {number} commentId 댓글 ID
     * @returns {boolean} 삭제 성공 여부
     */
    async deleteComment(commentId, userId) {
        const existingComment = await this.commentRepository.findById(commentId);
        if (!this.hasPermission(existingComment, userId)) {
            throw new Error('Permission denied');
        }

        return this.commentRepository.delete(commentId);
    }
}

export default CommentService;
