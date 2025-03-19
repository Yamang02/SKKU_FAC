import CommentDomainService from '../../../domain/comment/service/CommentDomainService.js';
import CommentDto from '../../../domain/comment/dto/CommentDto.js';
import Comment from '../../../domain/comment/entity/Comment.js';

/**
 * Comment 애플리케이션 서비스
 * 댓글 관련 유스케이스를 구현합니다.
 */
class CommentApplicationService {
    constructor(commentRepository) {
        this.commentRepository = commentRepository;
        this.commentDomainService = new CommentDomainService();
    }

    /**
     * 댓글을 생성합니다.
     * @param {Object} data - 댓글 생성 데이터
     * @returns {Promise<CommentDto.ResponseCommentDto>} 생성된 댓글
     */
    async createComment(data) {
        const createDTO = new CommentDto.CreateCommentDto(data);

        // 유효성 검사
        if (!this.commentDomainService.validateContent(createDTO.content)) {
            throw new Error('유효하지 않은 댓글 내용입니다.');
        }
        if (!this.commentDomainService.validateTargetType(createDTO.targetType)) {
            throw new Error('유효하지 않은 타겟 타입입니다.');
        }
        if (!this.commentDomainService.validateAuthor(createDTO.author)) {
            throw new Error('유효하지 않은 작성자입니다.');
        }

        // 대댓글인 경우 부모 댓글 확인
        if (createDTO.parent_id) {
            const parentComment = await this.commentRepository.findById(createDTO.parent_id);
            if (!this.commentDomainService.canCreateReply(parentComment)) {
                throw new Error('대댓글을 작성할 수 없습니다.');
            }
        }

        // 댓글 생성
        const comment = new Comment(createDTO.toEntity());
        const savedComment = await this.commentRepository.create(comment);
        return CommentDto.ResponseCommentDto.fromEntity(savedComment);
    }

    /**
     * 댓글을 수정합니다.
     * @param {number} commentId - 댓글 ID
     * @param {string} userId - 사용자 ID
     * @param {Object} data - 수정할 데이터
     * @returns {Promise<CommentDto.ResponseCommentDto>} 수정된 댓글
     */
    async updateComment(commentId, userId, data) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new Error('댓글을 찾을 수 없습니다.');
        }

        if (!this.commentDomainService.hasPermission(comment, userId)) {
            throw new Error('댓글을 수정할 권한이 없습니다.');
        }

        const updateDTO = new CommentDto.UpdateCommentDto(data);
        if (!this.commentDomainService.validateContent(updateDTO.content)) {
            throw new Error('유효하지 않은 댓글 내용입니다.');
        }

        const updatedComment = await this.commentRepository.update(commentId, updateDTO);
        return CommentDto.ResponseCommentDto.fromEntity(updatedComment);
    }

    /**
     * 댓글을 삭제합니다.
     * @param {number} commentId - 댓글 ID
     * @param {string} userId - 사용자 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteComment(commentId, userId) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new Error('댓글을 찾을 수 없습니다.');
        }

        if (!this.commentDomainService.hasPermission(comment, userId)) {
            throw new Error('댓글을 삭제할 권한이 없습니다.');
        }

        return this.commentRepository.delete(commentId);
    }

    /**
     * 특정 타겟의 댓글 목록을 조회합니다.
     * @param {Object} params - 조회 파라미터
     * @returns {Promise<CommentDto.ListResponseDto>} 댓글 목록과 페이지네이션 정보
     */
    async getCommentList({ targetType, targetId, page = 1, limit = 10 } = {}) {
        if (!this.commentDomainService.validateTargetType(targetType)) {
            throw new Error('유효하지 않은 타겟 타입입니다.');
        }
        if (!this.commentDomainService.validatePagination(page, limit)) {
            throw new Error('유효하지 않은 페이지네이션 파라미터입니다.');
        }

        const offset = (page - 1) * limit;
        const [comments, totalCount] = await Promise.all([
            this.commentRepository.findByTarget(targetType, targetId, offset, limit),
            this.commentRepository.countByTarget(targetType, targetId)
        ]);

        // 대댓글 조회 및 구조화
        const rootComments = comments.filter(comment => !comment.parent_id);
        const replyPromises = rootComments.map(async comment => {
            const replies = await this.commentRepository.findReplies(comment.id);
            return CommentDto.ResponseCommentDto.fromEntity(comment).addReplies(replies);
        });
        const structuredComments = await Promise.all(replyPromises);

        // 페이지네이션 정보 계산
        const totalPages = Math.ceil(totalCount / limit);
        const pagination = {
            currentPage: page,
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };

        return new CommentDto.ListResponseDto({
            comments: structuredComments,
            pagination
        });
    }

    /**
     * 작품별 댓글 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     * @param {number} page - 페이지 번호
     * @returns {Promise<Object>} 댓글 목록과 페이지네이션 정보
     */
    async getCommentsByArtworkId(artworkId, page = 1) {
        const limit = 10;
        const offset = (page - 1) * limit;

        const result = await this.commentRepository.findByArtworkId(artworkId, { limit, offset });
        const totalComments = await this.commentRepository.countByArtworkId(artworkId);
        const totalPages = Math.ceil(totalComments / limit);

        // 페이지 번호 배열 생성
        const maxPagesToShow = 5;
        let startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return {
            comments: result.map(comment => new CommentDto(comment)),
            pagination: {
                currentPage: page,
                totalPages,
                totalComments,
                limit,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                pages,
                showFirstPage: page > 3,
                showLastPage: page < totalPages - 2,
                showFirstEllipsis: page > 4,
                showLastEllipsis: page < totalPages - 3
            }
        };
    }

    /**
     * 공지사항 ID로 댓글을 조회합니다.
     * @param {number} noticeId - 공지사항 ID
     * @param {number} page - 페이지 번호
     * @returns {Promise<Object>} 댓글 목록과 페이지네이션 정보
     */
    async getCommentsByNoticeId(noticeId, page = 1) {
        const limit = 10;
        const offset = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            this.commentRepository.findByNoticeId(noticeId, limit, offset),
            this.commentRepository.countByNoticeId(noticeId)
        ]);

        // 페이지네이션 정보 생성
        const totalPages = Math.ceil(total / limit);
        const maxPagesToShow = 5;
        let startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return {
            comments,
            pagination: {
                currentPage: page,
                totalPages,
                totalComments: total,
                limit,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                pages,
                showFirstPage: page > 3,
                showLastPage: page < totalPages - 2,
                showFirstEllipsis: page > 4,
                showLastEllipsis: page < totalPages - 3
            }
        };
    }
}

export default CommentApplicationService;
