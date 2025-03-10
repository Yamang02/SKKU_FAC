/**
 * 댓글 데이터
 */
const comments = [
    {
        id: 1,
        artworkId: 1,
        author: '김방문',
        content: '정말 멋진 작품이네요. 작가님의 예술 세계가 돋보입니다.',
        date: '2024-02-11',
        formattedDate: '2024년 2월 11일'
    },
    {
        id: 2,
        artworkId: 1,
        author: '이감상',
        content: '파도의 역동성이 정말 잘 표현되어 있습니다. 일본 목판화의 정수를 보는 것 같아요.',
        date: '2024-02-12',
        formattedDate: '2024년 2월 12일'
    },
    {
        id: 3,
        artworkId: 2,
        author: '박미술',
        content: '소녀의 표정이 너무 인상적입니다. 베르메르의 빛 표현 기법이 돋보이는 작품이에요.',
        date: '2024-02-13',
        formattedDate: '2024년 2월 13일'
    },
    {
        id: 4,
        artworkId: 2,
        author: '최관람',
        content: '진주 귀걸이의 반짝임이 정말 사실적으로 표현되어 있어요. 어떻게 이런 효과를 낼 수 있는지 궁금합니다.',
        date: '2024-02-14',
        formattedDate: '2024년 2월 14일'
    },
    {
        id: 5,
        artworkId: 3,
        author: '정예술',
        content: '반 고흐의 소용돌이치는 별이 정말 아름답습니다. 그의 내면 세계가 느껴지는 작품이에요.',
        date: '2024-02-15',
        formattedDate: '2024년 2월 15일'
    },
    {
        id: 6,
        artworkId: 3,
        author: '강감성',
        content: '색채의 대비가 정말 인상적입니다. 반 고흐의 독특한 붓 터치가 잘 드러나는 작품이에요.',
        date: '2024-02-16',
        formattedDate: '2024년 2월 16일'
    },
    {
        id: 7,
        artworkId: 4,
        author: '윤명화',
        content: '모나리자의 미소는 정말 신비롭습니다. 다빈치의 천재성이 돋보이는 작품이에요.',
        date: '2024-02-17',
        formattedDate: '2024년 2월 17일'
    },
    {
        id: 8,
        artworkId: 4,
        author: '한갤러리',
        content: '배경의 풍경과 인물의 조화가 정말 아름답습니다. 르네상스 미술의 정수를 보는 것 같아요.',
        date: '2024-02-18',
        formattedDate: '2024년 2월 18일'
    }
];

// comments 배열 내보내기
export { comments };

/**
 * 작품 ID로 댓글 목록을 가져옵니다.
 * @param {number} artworkId - 작품 ID
 * @param {number} page - 페이지 번호 (기본값: 1)
 * @param {number} limit - 페이지당 댓글 수 (기본값: 5)
 * @returns {Object} 댓글 목록과 페이지네이션 정보
 */
export function getCommentsByArtworkId(artworkId, page = 1, limit = 5) {
    const artworkComments = comments.filter(comment => comment.artworkId === parseInt(artworkId));
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
