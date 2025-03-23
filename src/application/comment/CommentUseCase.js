/**
 * Comment 유스케이스
 * 댓글 관련 애플리케이션 로직을 처리합니다.
 */
class CommentUseCase {
    constructor(commentService) {
        this.commentService = commentService;
    }

    /**
     * 공지사항의 댓글 목록을 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @param {number} page - 페이지 번호
     * @param {number} limit - 페이지당 댓글 수
     * @returns {Promise<Object>} 댓글 목록과 페이지네이션 정보
     */
    async getNoticeComments(noticeId, page = 1, limit = 10) {
        if (!this.commentService.validatePagination(page, limit)) {
            throw new Error('Invalid pagination parameters');
        }
        return this.commentService.getCommentsByNoticeId(noticeId, page, limit);
    }

    /**
     * 작품의 댓글 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     * @param {number} page - 페이지 번호
     * @param {number} pageSize - 페이지당 댓글 수
     * @returns {Promise<Object>} 댓글 목록과 페이지네이션 정보
     */
    async getArtworkComments(artworkId, page = 1, pageSize = 6) {
        if (!this.commentService.validatePagination(page, pageSize)) {
            throw new Error('Invalid pagination parameters');
        }
        return this.commentService.getCommentsByArtworkId(artworkId, page, pageSize);
    }

    /**
     * 댓글을 추가합니다.
     * @param {Object} commentData - 댓글 데이터
     * @returns {Promise<Object>} 생성된 댓글 정보
     */
    async createComment(commentData) {
        return await this.commentService.create(commentData);
    }

    /**
     * 댓글을 수정합니다.
     * @param {number} commentId - 댓글 ID
     * @param {Object} commentData - 수정할 댓글 데이터
     * @returns {Promise<Object>} 수정된 댓글 정보
     */
    async updateComment(commentId, commentData) {
        return await this.commentService.update(commentId, commentData);
    }

    /**
     * 댓글을 삭제합니다.
     * @param {number} commentId - 댓글 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteComment(commentId) {
        return await this.commentService.delete(commentId);
    }

    /**
     * 공지사항의 모든 댓글을 삭제합니다.
     * @param {number} noticeId - 공지사항 ID
     * @returns {Promise<number>} 삭제된 댓글 수
     */
    async deleteNoticeComments(noticeId) {
        return this.commentService.deleteAllByNoticeId(noticeId);
    }

    /**
     * 사용자의 댓글 목록을 조회합니다.
     * @param {string} userId - 사용자 ID
     * @param {number} page - 페이지 번호
     * @param {number} limit - 페이지당 댓글 수
     * @returns {Promise<Array>} 댓글 목록
     */
    async getUserComments(userId, page = 1, limit = 10) {
        try {
            const comments = await this.commentService.findByUserId(userId, page, limit);
            return comments || [];
        } catch (error) {
            console.error('사용자 댓글 조회 중 오류:', error);
            return [];
        }
    }
}

export default CommentUseCase;
