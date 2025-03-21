import NoticeApplicationService from '../../application/notice/service/NoticeApplicationService.js';
import NoticeRepositoryImpl from '../../infrastructure/repository/NoticeRepositoryImpl.js';
import CommentApplicationService from '../../application/comment/service/CommentApplicationService.js';
import CommentRepositoryImpl from '../../infrastructure/repository/CommentRepositoryImpl.js';

class NoticeController {
    constructor() {
        const noticeRepository = new NoticeRepositoryImpl();
        const commentRepository = new CommentRepositoryImpl();

        this.noticeApplicationService = new NoticeApplicationService(noticeRepository);
        this.commentApplicationService = new CommentApplicationService(commentRepository);

        // 메서드 바인딩
        this.getNoticeList = this.getNoticeList.bind(this);
        this.getNoticeDetail = this.getNoticeDetail.bind(this);
    }

    /**
     * 공지사항 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getNoticeList(req, res) {
        try {
            const searchType = req.query.searchType || 'all';
            const keyword = req.query.keyword || '';
            const page = parseInt(req.query.page, 10) || 1;
            const limit = 10;

            const result = await this.noticeApplicationService.getNoticeList({
                searchType,
                keyword,
                page,
                limit
            });

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json(result);
            }

            res.render('notice/NoticeList', {
                title: '공지사항',
                searchType,
                keyword,
                ...result
            });
        } catch (error) {
            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }

    /**
     * 공지사항 상세 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getNoticeDetail(req, res) {
        try {
            const noticeId = parseInt(req.params.id, 10);
            const commentPage = parseInt(req.query.commentPage) || 1;
            const notice = await this.noticeApplicationService.getNoticeDetail(noticeId);

            if (!notice) {
                return res.status(404).render('error/404');
            }

            const commentData = await this.commentApplicationService.getCommentsByNoticeId(noticeId, commentPage);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json({ notice, comments: commentData.comments });
            }

            res.render('notice/NoticeDetail', {
                title: notice.title,
                notice,
                comments: commentData.comments,
                commentPagination: commentData.pagination,
                searchType: req.query.searchType || 'all',
                keyword: req.query.keyword || '',
                user: req.session.user || null
            });
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(404).json({ error: error.message });
            }

            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }
}

export default NoticeController;
