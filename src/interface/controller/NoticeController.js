import ViewResolver from '../../presentation/view/ViewResolver.js';
import { ViewPath } from '../../presentation/view/ViewPath.js';

class NoticeController {
    /**
     * NoticeController 생성자
     * @param {NoticeUseCase} noticeUseCase - 공지사항 유스케이스
     */
    constructor(noticeUseCase) {
        this.noticeUseCase = noticeUseCase;

        // 메서드 바인딩
        this.getNoticeList = this.getNoticeList.bind(this);
        this.getNoticeDetail = this.getNoticeDetail.bind(this);
        this.createNotice = this.createNotice.bind(this);
        this.updateNotice = this.updateNotice.bind(this);
        this.deleteNotice = this.deleteNotice.bind(this);
    }

    /**
     * 공지사항 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getNoticeList(req, res) {
        try {
            const result = await this.noticeUseCase.getNoticeList({
                searchType: req.query.searchType || 'all',
                keyword: req.query.keyword || '',
                page: parseInt(req.query.page, 10) || 1,
                limit: parseInt(req.query.limit, 10) || 10
            });

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json(result);
            }

            ViewResolver.render(res, ViewPath.NOTICE.LIST, {
                title: '공지사항',
                searchType: req.query.searchType || 'all',
                keyword: req.query.keyword || '',
                ...result
            });
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({ error: error.message });
            }
            ViewResolver.render(res, ViewPath.ERROR.ERROR, {
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
            const { notice, comments, pagination } = await this.noticeUseCase.getNoticeDetail(noticeId, {
                page: parseInt(req.query.commentPage, 10) || 1,
                limit: 10
            });

            ViewResolver.render(res, ViewPath.NOTICE.DETAIL, {
                title: notice.title,
                notice,
                comments,
                pagination,
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Error in getNoticeDetail:', error);
            ViewResolver.render(res, ViewPath.ERROR.ERROR, {
                title: '오류가 발생했습니다',
                message: error.message || '공지사항을 찾을 수 없습니다.'
            });
        }
    }

    /**
     * 공지사항 작성을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async createNotice(req, res) {
        try {
            const notice = await this.noticeUseCase.createNotice(req.body, req.session.user.id);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(201).json(notice);
            }

            res.redirect(`/notice/${notice.id}`);
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(400).json({ error: error.message });
            }

            ViewResolver.render(res, ViewPath.NOTICE.CREATE, {
                title: '공지사항 작성',
                error: error.message,
                formData: req.body
            });
        }
    }

    /**
     * 공지사항 수정을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async updateNotice(req, res) {
        try {
            const noticeId = parseInt(req.params.id, 10);
            const notice = await this.noticeUseCase.updateNotice(noticeId, req.body);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json(notice);
            }

            res.redirect(`/notice/${notice.id}`);
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(400).json({ error: error.message });
            }

            ViewResolver.render(res, ViewPath.NOTICE.EDIT, {
                title: '공지사항 수정',
                error: error.message,
                formData: { ...req.body, id: req.params.id }
            });
        }
    }

    /**
     * 공지사항 삭제를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async deleteNotice(req, res) {
        try {
            const noticeId = parseInt(req.params.id, 10);
            await this.noticeUseCase.deleteNotice(noticeId);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json({ success: true });
            }

            res.redirect('/notice');
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(400).json({ error: error.message });
            }

            ViewResolver.render(res, ViewPath.ERROR.ERROR, {
                title: '에러',
                message: error.message
            });
        }
    }
}

export default NoticeController;
