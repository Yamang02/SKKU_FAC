/**
 * 댓글 DTO 클래스
 * 댓글 데이터를 전송하기 위한 객체입니다.
 */
class CommentDto {
    constructor(comment) {
        this.id = comment.id;
        this.content = comment.content;
        this.author = comment.username || (comment.user && comment.user.username) || '알 수 없는 사용자';
        this.artwork_id = comment.artwork_id;
        this.notice_id = comment.notice_id;
        this.created_at = this.formatDate(comment.created_at);
        this.updated_at = comment.updated_at ? this.formatDate(comment.updated_at) : null;

        // 사용자 정보
        this.user = {
            id: comment.user_id || (comment.user && comment.user.id),
            username: comment.username || (comment.user && comment.user.username),
            department: comment.department || (comment.user && comment.user.department),
            student_id: comment.student_id || (comment.user && comment.user.student_id)
        };
    }

    formatDate(date) {
        if (!date) return '';

        const dateObj = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - dateObj) / 1000); // 초 단위 차이

        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

        return dateObj.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static fromEntity(comment) {
        return new CommentDto(comment);
    }

    static toEntity(dto) {
        return {
            id: dto.id,
            content: dto.content,
            artwork_id: dto.artwork_id,
            notice_id: dto.notice_id,
            created_at: dto.created_at,
            updated_at: dto.updated_at,
            user_id: dto.user.id,
            username: dto.user.username,
            department: dto.user.department,
            student_id: dto.user.student_id
        };
    }

    /**
     * 댓글 생성 DTO
     */
    static CreateCommentDto = class {
        constructor({ content, author, targetType, targetId, parent_id = null }) {
            this.content = content;
            this.author = author;
            this.targetType = targetType;
            this.targetId = targetId;
            this.parent_id = parent_id;
        }

        toEntity() {
            return {
                content: this.content,
                author: this.author,
                targetType: this.targetType,
                targetId: this.targetId,
                parent_id: this.parent_id,
                created_at: new Date(),
                updated_at: new Date(),
                is_deleted: false
            };
        }
    };

    /**
     * 댓글 수정 DTO
     */
    static UpdateCommentDto = class {
        constructor({ content }) {
            this.content = content;
            this.updated_at = new Date();
        }
    };

    /**
     * 댓글 응답 DTO
     */
    static ResponseCommentDto = class {
        constructor(comment) {
            this.id = comment.id;
            this.content = comment.is_deleted ? '삭제된 댓글입니다.' : comment.content;
            this.author = comment.author;
            this.targetType = comment.targetType;
            this.targetId = comment.targetId;
            this.created_at = comment.created_at;
            this.updated_at = comment.updated_at;
            this.is_deleted = comment.is_deleted;
            this.parent_id = comment.parent_id;
            this.replies = [];
        }

        static fromEntity(comment) {
            return new CommentDto.ResponseCommentDto(comment);
        }

        static fromEntityList(comments) {
            return comments.map(comment => CommentDto.ResponseCommentDto.fromEntity(comment));
        }

        addReplies(replies) {
            this.replies = CommentDto.ResponseCommentDto.fromEntityList(replies);
            return this;
        }
    };

    /**
     * 댓글 목록 응답 DTO
     */
    static ListResponseDto = class {
        constructor({ comments, pagination }) {
            this.comments = CommentDto.ResponseCommentDto.fromEntityList(comments);
            this.pagination = pagination;
        }
    };
}

export default CommentDto;
