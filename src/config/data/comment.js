/**
 * 임시 댓글 데이터
 * @type {Array<Object>}
 */
export const comment = [
    {
        id: 1,
        content: '정말 멋진 작품이네요!',
        artwork_id: 1,
        user_id: 1,
        username: '김예술',
        created_at: '2024-03-15T09:00:00.000Z',
        updated_at: '2024-03-15T09:00:00.000Z'
    },
    {
        id: 2,
        content: '색감이 너무 아름답습니다.',
        artwork_id: 1,
        user_id: 2,
        username: '이감상',
        created_at: '2024-03-15T10:30:00.000Z',
        updated_at: '2024-03-15T10:30:00.000Z'
    },
    {
        id: 3,
        content: '작가님의 생각이 궁금해요.',
        artwork_id: 2,
        user_id: 3,
        username: '박미술',
        created_at: '2024-03-16T11:00:00.000Z',
        updated_at: '2024-03-16T11:00:00.000Z'
    },
    {
        id: 4,
        content: '전시회 일정이 궁금합니다.',
        notice_id: 1,
        user_id: 1,
        username: '김예술',
        created_at: '2024-03-17T09:00:00.000Z',
        updated_at: '2024-03-17T09:00:00.000Z'
    },
    {
        id: 5,
        content: '참여 신청은 어디서 하나요?',
        notice_id: 1,
        user_id: 2,
        username: '이감상',
        created_at: '2024-03-17T10:30:00.000Z',
        updated_at: '2024-03-17T10:30:00.000Z'
    },
    {
        id: 6,
        content: '공모전 접수 기간이 연장되나요?',
        notice_id: 2,
        user_id: 3,
        username: '박미술',
        created_at: '2024-03-18T11:00:00.000Z',
        updated_at: '2024-03-18T11:00:00.000Z'
    }
];

/**
 * 작품 ID로 댓글 목록을 가져옵니다.
 * @param {number} artworkId - 작품 ID
 * @param {number} page - 페이지 번호 (기본값: 1)
 * @param {number} limit - 페이지당 댓글 수 (기본값: 5)
 * @returns {Object} 댓글 목록과 페이지네이션 정보
 */
export function getCommentsByArtworkId(artworkId, page = 1, limit = 5) {
    const artworkComments = comment.filter(c => c.artwork_id === parseInt(artworkId));
    const totalComments = artworkComments.length;
    const totalPages = Math.ceil(totalComments / limit);

    // 페이지 번호 유효성 검사
    const currentPage = page < 1 ? 1 : (page > totalPages && totalPages > 0 ? totalPages : page);

    // 페이지에 해당하는 댓글 추출
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = artworkComments.slice(startIndex, endIndex);

    // 페이지네이션 정보 생성
    const pagination = {
        totalComments,
        totalPages,
        currentPage,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        pages: generatePageNumbers(currentPage, totalPages),
        showFirstPage: currentPage > 3,
        showLastPage: currentPage < totalPages - 2,
        showFirstEllipsis: currentPage > 4,
        showLastEllipsis: currentPage < totalPages - 3
    };

    return {
        comments: paginatedComments,
        pagination
    };
}

/**
 * 페이지 번호 배열을 생성합니다.
 * @param {number} currentPage - 현재 페이지 번호
 * @param {number} totalPages - 전체 페이지 수
 * @returns {Array} 페이지 번호 배열
 */
function generatePageNumbers(currentPage, totalPages) {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return pages;
}
