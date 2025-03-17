/**
 * 공지사항 임시 데이터
 */

const notices = [
    {
        id: 1,
        title: '2024학년도 1학기 수강신청 안내',
        content: '2024학년도 1학기 수강신청 일정 및 유의사항을 안내드립니다. 수강신청 기간은 2024년 2월 19일부터 23일까지입니다.',
        created_at: '2024-02-15',
        author: '학사지원팀',
        views: 245,
        is_important: true
    },
    {
        id: 2,
        title: '미술대학 졸업전시회 개최 안내',
        content: '2023학년도 미술대학 졸업전시회가 3월 2일부터 9일까지 성균갤러리에서 개최됩니다. 많은 관심과 참여 부탁드립니다.',
        created_at: '2024-02-14',
        author: '미술학과',
        views: 189,
        is_important: true
    },
    {
        id: 3,
        title: '2024년도 교내 미술 공모전 안내',
        content: '2024년도 교내 미술 공모전을 개최합니다. 접수 기간은 3월 1일부터 31일까지이며, 자세한 내용은 공지사항을 참고해주세요.',
        created_at: '2024-02-13',
        author: '문화예술부',
        views: 156,
        is_important: false
    }
];

export function findAll() {
    return [...notices];
}

export function findById(id) {
    return notices.find(notice => notice.id === id);
}

export function findBySearchType(searchType, keyword) {
    if (!keyword) return findAll();

    const loweredKeyword = keyword.toLowerCase();
    return notices.filter(notice => {
        switch (searchType) {
        case 'title':
            return notice.title.toLowerCase().includes(loweredKeyword);
        case 'content':
            return notice.content.toLowerCase().includes(loweredKeyword);
        case 'author':
            return notice.author.toLowerCase().includes(loweredKeyword);
        case 'all':
        default:
            return notice.title.toLowerCase().includes(loweredKeyword) ||
                    notice.content.toLowerCase().includes(loweredKeyword) ||
                    notice.author.toLowerCase().includes(loweredKeyword);
        }
    });
}

export function incrementViews(id) {
    const notice = notices.find(notice => notice.id === id);
    if (notice) {
        notice.views += 1;
        return notice.views;
    }
    return null;
}
