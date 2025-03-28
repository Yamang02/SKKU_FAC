// 공지사항 Mock 데이터
const notices = [
    {
        id: 1,
        title: '2024학년도 1학기 학사일정 안내',
        content: '2024학년도 1학기 학사일정을 안내드립니다.\n\n1. 개강: 2024년 3월 4일\n2. 수강신청: 2024년 2월 19일 ~ 2월 23일\n3. 중간고사: 2024년 4월 15일 ~ 4월 19일\n4. 기말고사: 2024년 6월 17일 ~ 6월 21일\n\n자세한 일정은 포털을 참고해주세요.',
        author: '학사지원팀',
        status: 'active',
        is_important: true,
        created_at: '2024-02-15T09:00:00Z',
        updated_at: '2024-02-15T09:00:00Z'
    },
    {
        id: 2,
        title: '2024학년도 1학기 장학금 신청 안내',
        content: '2024학년도 1학기 장학금 신청이 시작됩니다.\n\n1. 신청기간: 2024년 2월 26일 ~ 3월 1일\n2. 신청방법: 포털 → 장학금 → 장학금신청\n3. 제출서류: 성적증명서, 가계수급자증명서 등\n\n자세한 내용은 장학팀으로 문의해주세요.',
        author: '장학팀',
        status: 'active',
        is_important: true,
        created_at: '2024-02-14T14:30:00Z',
        updated_at: '2024-02-14T14:30:00Z'
    },
    {
        id: 3,
        title: '2024학년도 1학기 수강신청 안내',
        content: '2024학년도 1학기 수강신청 일정을 안내드립니다.\n\n1. 수강신청 기간: 2024년 2월 19일 ~ 2월 23일\n2. 수강정정 기간: 2024년 3월 4일 ~ 3월 8일\n3. 수강포기 기간: 2024년 4월 1일 ~ 4월 5일\n\n수강신청 전에 수강신청 가이드를 확인해주세요.',
        author: '교무팀',
        status: 'active',
        is_important: false,
        created_at: '2024-02-13T10:00:00Z',
        updated_at: '2024-02-13T10:00:00Z'
    }
];

/**
 * 모든 공지사항을 반환합니다.
 * @returns {Promise<Array<import('../../models/notice/Notice').Notice>>} 공지사항 목록
 */
export const findNotices = async ({ page = 1, limit = 10, search, status, isImportant } = {}) => {
    let filteredNotices = [...notices];

    if (search) {
        filteredNotices = filteredNotices.filter(notice =>
            notice.title.includes(search) ||
            notice.content.includes(search)
        );
    }

    if (status) {
        filteredNotices = filteredNotices.filter(notice =>
            notice.status === status
        );
    }

    if (isImportant !== undefined) {
        filteredNotices = filteredNotices.filter(notice =>
            notice.is_important === (isImportant === 'true')
        );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const total = filteredNotices.length;

    return {
        items: filteredNotices.slice(start, end),
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
    };
};

/**
 * ID로 공지사항을 찾습니다.
 * @param {number} id - 공지사항 ID
 * @returns {Promise<import('../../models/notice/Notice').Notice|null>} 찾은 공지사항 또는 null
 */
export const findNoticeById = async (id) => {
    return notices.find(notice => notice.id === Number(id)) || null;
};

/**
 * 새로운 공지사항을 생성합니다.
 * @param {Object} data - 공지사항 데이터
 * @returns {Promise<import('../../models/notice/Notice').Notice>} 생성된 공지사항
 */
export const createNotice = async (data) => {
    const newNotice = {
        ...data,
        id: Math.max(...notices.map(n => n.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    notices.push(newNotice);
    return newNotice;
};

/**
 * 공지사항을 수정합니다.
 * @param {number} id - 공지사항 ID
 * @param {Object} data - 수정할 데이터
 * @returns {Promise<import('../../models/notice/Notice').Notice|null>} 수정된 공지사항 또는 null
 */
export const updateNotice = async (id, data) => {
    const index = notices.findIndex(notice => notice.id === Number(id));
    if (index === -1) return null;

    notices[index] = {
        ...notices[index],
        ...data,
        updated_at: new Date().toISOString()
    };
    return notices[index];
};

/**
 * 공지사항을 삭제합니다.
 * @param {number} id - 공지사항 ID
 * @returns {Promise<boolean>} 성공 여부
 */
export const deleteNotice = async (id) => {
    const index = notices.findIndex(notice => notice.id === Number(id));
    if (index === -1) return false;

    notices.splice(index, 1);
    return true;
};

/**
 * 중요 공지사항을 조회합니다.
 * @returns {Promise<Array<import('../../models/notice/Notice').Notice>>} 중요 공지사항 목록
 */
export const findImportantNotices = async () => {
    return notices.filter(notice => notice.is_important);
};

// /**
//  * 공지사항의 댓글을 조회합니다.
//  * @param {number} noticeId - 공지사항 ID
//  * @param {Object} options - 페이지네이션 옵션
//  * @returns {Promise<Object>} 댓글 목록과 페이지네이션 정보
//  */
// export const findComments = async (noticeId, { page = 1, limit = 10 } = {}) => {
//     // 임시로 더미 댓글 데이터 반환
//     const dummyComments = [
//         {
//             id: 1,
//             content: '좋은 공지사항 감사합니다.',
//             author: '홍길동',
//             created_at: new Date().toISOString()
//         },
//         {
//             id: 2,
//             content: '잘 읽었습니다.',
//             author: '김철수',
//             created_at: new Date().toISOString()
//         }
//     ];
//
//     return {
//         items: dummyComments,
//         total: dummyComments.length,
//         page: Number(page),
//         totalPages: Math.ceil(dummyComments.length / limit)
//     };
// };

