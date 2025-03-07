import Comment from '../entity/Comment.js';
import CommentDTO from '../dto/CommentDTO.js';
import commentsData from '../../../infrastructure/data/comments.js';

/**
 * 작품 ID에 해당하는 댓글 목록을 가져옵니다.
 * @param {number} artworkId 작품 ID
 * @param {number} page 페이지 번호 (1부터 시작)
 * @param {number} pageSize 페이지당 댓글 수
 * @returns {Object} 댓글 목록과 페이지네이션 정보
 */
export function getCommentsByArtworkId(artworkId, page = 1, pageSize = 6) {
    // 작품 ID에 해당하는 댓글 필터링
    const filteredComments = commentsData.filter(comment => 
        comment.artworkId === parseInt(artworkId)
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
    const commentEntities = paginatedComments.map(comment => new Comment(comment));
    const commentDTOs = commentEntities.map(comment => new CommentDTO(comment));
    
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
export function addComment(commentData) {
    // 실제 구현에서는 데이터베이스에 저장하는 로직이 필요합니다.
    // 여기서는 메모리에 추가하는 것으로 대체합니다.
    const newComment = {
        id: commentsData.length + 1,
        artworkId: parseInt(commentData.artworkId),
        author: commentData.author,
        content: commentData.content,
        date: new Date().toISOString().split('T')[0],
        isEditable: true
    };
    
    commentsData.push(newComment);
    
    const commentEntity = new Comment(newComment);
    return new CommentDTO(commentEntity);
}

/**
 * 댓글을 수정합니다.
 * @param {number} commentId 댓글 ID
 * @param {Object} commentData 수정할 댓글 데이터
 * @returns {CommentDTO|null} 수정된 댓글 DTO 또는 null
 */
export function updateComment(commentId, commentData) {
    // 댓글 찾기
    const commentIndex = commentsData.findIndex(comment => 
        comment.id === parseInt(commentId)
    );
    
    if (commentIndex === -1) {
        return null;
    }
    
    // 댓글 수정
    commentsData[commentIndex] = {
        ...commentsData[commentIndex],
        content: commentData.content,
        // 수정 시간 업데이트는 실제 구현에서 필요할 수 있습니다.
    };
    
    const commentEntity = new Comment(commentsData[commentIndex]);
    return new CommentDTO(commentEntity);
}

/**
 * 댓글을 삭제합니다.
 * @param {number} commentId 댓글 ID
 * @returns {boolean} 삭제 성공 여부
 */
export function deleteComment(commentId) {
    // 댓글 찾기
    const commentIndex = commentsData.findIndex(comment => 
        comment.id === parseInt(commentId)
    );
    
    if (commentIndex === -1) {
        return false;
    }
    
    // 댓글 삭제
    commentsData.splice(commentIndex, 1);
    
    return true;
}