/**
 * Comment 도메인 서비스
 * 댓글 도메인의 비즈니스 로직을 담당합니다.
 */
class CommentDomainService {
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
}

export default CommentDomainService;
