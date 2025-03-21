import Comment from '../entity/Comment.js';
import CommentDTO from '../dto/CommentDTO.js';
import { comment } from '../../../infrastructure/data/comment.js';
import CommentRepositoryImpl from '../../../infrastructure/repository/CommentRepositoryImpl.js';

/**
 * Comment 서비스
 * 댓글 관련 도메인 로직을 처리합니다.
 */
class CommentService {
    constructor() {
        this.commentRepository = new CommentRepositoryImpl();
    }

    async getCommentsByNoticeId(noticeId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const comments = await this.commentRepository.findByNoticeId(noticeId, offset, limit);
        const totalCount = await this.commentRepository.countByNoticeId(noticeId);

        return {
            comments,
            commentPagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit
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
        // 작품 ID에 해당하는 댓글 필터링
        const filteredComments = comment.filter(c =>
            c.artworkId === parseInt(artworkId)
        );

        // 전체 댓글 수
        const totalComments = filteredComments.length;

        // 전체 페이지 수 계산
        const totalPages = Math.ceil(totalComments / pageSize);

        // 페이지 번호 유효성 검사
        const validPage = Math.max(1, Math.min(page, totalPages || 1));

        // 페이지에 해당하는 댓글 추출
        const startIndex = (validPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedComments = filteredComments.slice(startIndex, endIndex);

        // 댓글 엔티티 생성 및 DTO 변환
        const commentEntities = paginatedComments.map(c => new Comment(c));
        const commentDTOs = commentEntities.map(c => new CommentDTO(c));

        // 페이지네이션 계산
        const startPage = Math.max(1, validPage - 1);
        const endPage = Math.min(totalPages, startPage + 2);

        // 페이지네이션 정보 생성
        return {
            comments: commentDTOs,
            pagination: {
                currentPage: validPage,
                totalPages,
                totalComments,
                hasNextPage: validPage < totalPages,
                hasPrevPage: validPage > 1,
                // 페이지네이션 UI를 위한 추가 정보
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
        const newComment = {
            id: comment.length + 1,
            artworkId: parseInt(commentData.artworkId),
            author: commentData.author,
            content: commentData.content,
            date: new Date().toISOString().split('T')[0],
            isEditable: true
        };

        comment.push(newComment);

        const commentEntity = new Comment(newComment);
        return new CommentDTO(commentEntity);
    }

    /**
     * 댓글을 수정합니다.
     * @param {number} commentId 댓글 ID
     * @param {Object} commentData 수정할 댓글 데이터
     * @returns {CommentDTO|null} 수정된 댓글 DTO 또는 null
     */
    async updateComment(commentId, commentData) {
        const commentIndex = comment.findIndex(c =>
            c.id === parseInt(commentId)
        );

        if (commentIndex === -1) {
            return null;
        }

        comment[commentIndex] = {
            ...comment[commentIndex],
            content: commentData.content
        };

        const commentEntity = new Comment(comment[commentIndex]);
        return new CommentDTO(commentEntity);
    }

    /**
     * 댓글을 삭제합니다.
     * @param {number} commentId 댓글 ID
     * @returns {boolean} 삭제 성공 여부
     */
    async deleteComment(commentId) {
        const commentIndex = comment.findIndex(c =>
            c.id === parseInt(commentId)
        );

        if (commentIndex === -1) {
            return false;
        }

        comment.splice(commentIndex, 1);
        return true;
    }
}

export default CommentService;
