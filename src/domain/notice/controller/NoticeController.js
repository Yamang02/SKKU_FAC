import viewResolver from '../../../presentation/view/ViewResolver.js';
import * as noticeData from '../../../infrastructure/data/notice.js';

/**
 * 공지사항 컨트롤러
 * HTTP 요청을 처리하고 서비스 레이어와 연결합니다.
 */
// 나중에 NoticeService가 구현되면 추가할 예정
// import noticeService from '../service/NoticeService.js';

/**
 * 공지사항 목록 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getNoticeList(req, res) {
    const searchType = req.query.searchType || 'all';
    const keyword = req.query.keyword || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;  // 페이지당 항목 수

    const notices = noticeData.findBySearchType(searchType, keyword);
    const totalCount = notices.length;
    const totalPages = Math.ceil(totalCount / limit);

    // 페이지네이션을 위한 데이터 계산
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotices = notices.slice(startIndex, endIndex);

    const pagination = {
        currentPage: page,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };

    viewResolver.render(res, 'notice/NoticeList', {
        title: '공지사항',
        notices: paginatedNotices,
        searchType,
        keyword,
        totalCount,
        pagination
    });
}

/**
 * 공지사항 상세 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getNoticeDetail(req, res) {
    const noticeId = parseInt(req.params.id, 10);
    const notice = noticeData.findById(noticeId);
    const commentPage = parseInt(req.query.commentPage, 10) || 1;
    const commentsPerPage = 10;

    if (!notice) {
        return res.status(404).send('공지사항을 찾을 수 없습니다.');
    }

    // 이전/다음 공지 ID 찾기
    const notices = noticeData.findBySearchType('all', '');
    const currentIndex = notices.findIndex(n => n.id === noticeId);

    notice.prevId = currentIndex > 0 ? notices[currentIndex - 1].id : null;
    notice.nextId = currentIndex < notices.length - 1 ? notices[currentIndex + 1].id : null;

    // 조회수 증가
    noticeData.incrementViews(noticeId);

    // 임시 댓글 데이터
    const comments = [];
    const totalComments = 0;
    const totalPages = Math.ceil(totalComments / commentsPerPage);

    const commentPagination = {
        currentPage: commentPage,
        totalPages: totalPages,
        totalComments: totalComments,
        hasNext: commentPage < totalPages,
        hasPrev: commentPage > 1
    };

    viewResolver.render(res, 'notice/NoticeDetail', {
        title: notice.title,
        notice: notice,
        comments,
        commentPagination
    });
}
