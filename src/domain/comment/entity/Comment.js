/**
 * Comment 엔티티 클래스
 * 댓글 도메인의 핵심 엔티티입니다.
 */
class Comment {
    constructor({
        id,
        content,
        author,
        targetType,
        targetId,
        created_at = new Date(),
        updated_at = new Date(),
        is_deleted = false,
        parent_id = null
    }) {
        this.id = id;
        this.content = content;
        this.author = author;
        this.targetType = targetType;  // 'notice' 또는 'artwork'
        this.targetId = targetId;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
        this.parent_id = parent_id;  // 대댓글을 위한 부모 댓글 ID
    }

    /**
     * 댓글 내용을 수정합니다.
     * @param {string} newContent - 새로운 댓글 내용
     */
    updateContent(newContent) {
        this.content = newContent;
        this.updated_at = new Date();
    }

    /**
     * 댓글을 삭제 상태로 변경합니다.
     */
    delete() {
        this.is_deleted = true;
        this.updated_at = new Date();
    }

    /**
     * 댓글이 특정 사용자의 소유인지 확인합니다.
     * @param {string} userId - 사용자 ID
     * @returns {boolean} 소유 여부
     */
    isOwnedBy(userId) {
        return this.author === userId;
    }

    /**
     * 대댓글인지 확인합니다.
     * @returns {boolean} 대댓글 여부
     */
    isReply() {
        return this.parent_id !== null;
    }

    /**
     * 엔티티를 JSON 형태로 변환합니다.
     * @returns {Object} JSON 객체
     */
    toJSON() {
        return {
            id: this.id,
            content: this.content,
            author: this.author,
            targetType: this.targetType,
            targetId: this.targetId,
            created_at: this.created_at,
            updated_at: this.updated_at,
            is_deleted: this.is_deleted,
            parent_id: this.parent_id
        };
    }
}

export default Comment;
