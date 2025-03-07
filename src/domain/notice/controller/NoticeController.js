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
    try {
        // 공지사항 목록을 가져오는 로직 추가 필요
        // const notices = noticeService.getAllNotices();
        
        res.render('notices/index', {
            title: '공지사항'
            // notices
        });
    } catch (error) {
        // console.error('공지사항 목록 조회 오류:', error);
        res.status(500).render('error', { 
            message: '공지사항 목록을 불러오는 중 오류가 발생했습니다.' 
        });
    }
}

/**
 * 공지사항 상세 페이지를 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
export function getNoticeDetail(req, res) {
    try {
        // const noticeId = req.params.id; // 현재 사용되지 않음
        
        // 공지사항 정보를 가져오는 로직 추가 필요
        // const notice = noticeService.getNoticeById(noticeId);
        
        // if (!notice) {
        //     return res.status(404).render('error', {
        //         message: '공지사항을 찾을 수 없습니다.'
        //     });
        // }
        
        res.render('notices/detail', {
            title: '공지사항 상세'
            // notice
        });
    } catch (error) {
        // console.error('공지사항 상세 조회 오류:', error);
        res.status(500).render('error', { 
            message: '공지사항을 불러오는 중 오류가 발생했습니다.' 
        });
    }
} 