/**
 * 댓글 DTO 클래스
 * 댓글 데이터를 전송하기 위한 객체입니다.
 */
class CommentDto {
    constructor(comment) {
        this.id = comment.id;
        this.content = comment.content;
        this.artwork_id = comment.artwork_id;
        this.user_id = comment.user_id;
        this.username = comment.username;
        this.created_at = comment.created_at;
        this.updated_at = comment.updated_at;
    }

    static fromEntity(comment) {
        return new CommentDto(comment);
    }

    static toEntity(dto) {
        return {
            id: dto.id,
            content: dto.content,
            artwork_id: dto.artwork_id,
            user_id: dto.user_id,
            username: dto.username,
            created_at: dto.created_at,
            updated_at: dto.updated_at
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
