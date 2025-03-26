/**
 * 공지사항 샘플 데이터
 */
const notices = [
    {
        id: 1,
        title: '2024년도 성균관대학교 미술관 개관 안내',
        content: '안녕하세요. 성균관대학교 미술관입니다.\n\n2024년도 성균관대학교 미술관이 개관되었습니다.\n\n개관 시간: 평일 10:00 - 18:00\n주말 및 공휴일: 10:00 - 17:00\n\n많은 관람 부탁드립니다.',
        author: '관리자',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isImportant: true,
        views: 150,
        status: 'active'
    },
    {
        id: 2,
        title: '2024년도 전시 일정 안내',
        content: '2024년도 성균관대학교 미술관 전시 일정을 안내드립니다.\n\n1. 2024년 1월 - 2월: 신년 특별전\n2. 2024년 3월 - 4월: 신진 작가전\n3. 2024년 5월 - 6월: 졸업 작품전\n4. 2024년 7월 - 8월: 여름 특별전\n5. 2024년 9월 - 10월: 가을 특별전\n6. 2024년 11월 - 12월: 연말 특별전\n\n자세한 내용은 추후 공지하겠습니다.',
        author: '관리자',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        isImportant: true,
        views: 120,
        status: 'active'
    },
    {
        id: 3,
        title: '미술관 휴관 안내',
        content: '2024년 2월 9일(금)부터 2월 12일(월)까지 설 연휴로 인해 미술관이 휴관됩니다.\n\n2월 13일(화)부터 정상 운영됩니다.\n\n불편을 드려 죄송합니다.',
        author: '관리자',
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
        isImportant: false,
        views: 80,
        status: 'active'
    }
];

/**
 * 모든 공지사항을 반환합니다.
 * @returns {Array} 공지사항 목록
 */
export const findAll = () => {
    return [...notices];
};

/**
 * 검색 조건에 맞는 공지사항을 반환합니다.
 * @param {string} searchType - 검색 유형 (all, title, content)
 * @param {string} keyword - 검색어
 * @returns {Array} 검색된 공지사항 목록
 */
export const findBySearchType = (searchType, keyword) => {
    if (!keyword) return [...notices];

    return notices.filter(notice => {
        switch (searchType) {
        case 'title':
            return notice.title.includes(keyword);
        case 'content':
            return notice.content.includes(keyword);
        case 'all':
        default:
            return notice.title.includes(keyword) || notice.content.includes(keyword);
        }
    });
};

/**
 * ID로 공지사항을 찾습니다.
 * @param {number} id - 공지사항 ID
 * @returns {Object|null} 찾은 공지사항 또는 null
 */
export const findById = (id) => {
    return notices.find(notice => notice.id === id) || null;
};

/**
 * 공지사항의 조회수를 증가시킵니다.
 * @param {number} id - 공지사항 ID
 */
export const incrementViews = (id) => {
    const notice = notices.find(n => n.id === id);
    if (notice) {
        notice.views += 1;
    }
};
