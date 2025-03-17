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

    const notices = noticeData.findBySearchType(searchType, keyword);

    return viewResolver.render(res, 'notice/NoticeList', {
        notices,
        searchType,
        keyword,
        totalCount: notices.length
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

    if (!notice) {
        return res.status(404).send('공지사항을 찾을 수 없습니다.');
    }

    // 조회수 증가
    noticeData.incrementViews(noticeId);

    return viewResolver.render(res, 'notice/NoticeDetail', {
        notice
    });
}
