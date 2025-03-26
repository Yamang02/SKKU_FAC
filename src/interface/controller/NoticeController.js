import ViewResolver from '../../presentation/util/ViewResolver.js';
import { ViewPath } from '../../presentation/constant/ViewPath.js';

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
        this.getAdminNoticeList = this.getAdminNoticeList.bind(this);
        this.getAdminNoticeDetail = this.getAdminNoticeDetail.bind(this);
        this.updateAdminNotice = this.updateAdminNotice.bind(this);
        this.deleteAdminNotice = this.deleteAdminNotice.bind(this);
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

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.LIST, {
                currentPage: req.path,
                title: '공지사항',
                searchType: req.query.searchType || 'all',
                keyword: req.query.keyword || '',
                ...result
            });
        } catch (error) {
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({ error: error.message });
            }
            ViewResolver.renderError(res, error);
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

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.DETAIL, {
                currentPage: req.path,
                title: notice.title,
                notice,
                comments,
                pagination,
                user: req.session.user || null
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
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

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.CREATE, {
                currentPage: req.path,
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

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.EDIT, {
                currentPage: req.path,
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

            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 공지사항 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getAdminNoticeList(req, res) {
        try {
            const searchType = req.query.searchType || 'all';
            const keyword = req.query.keyword || '';
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const status = req.query.status || '';
            const isImportant = req.query.isImportant === 'true' ? true :
                req.query.isImportant === 'false' ? false : null;

            const result = await this.noticeUseCase.getNoticeList({
                searchType,
                keyword,
                page,
                limit,
                status,
                isImportant
            });

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.json(result);
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.LIST, {
                currentPage: '/admin/management/notice/list',
                title: '공지사항 관리',
                searchType,
                keyword,
                filters: {
                    status,
                    isImportant,
                    searchType,
                    keyword
                },
                result,
                user: req.session.user || null,
                page
            });
        } catch (error) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(500).json({ error: error.message });
            }
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 공지사항 상세 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getAdminNoticeDetail(req, res) {
        try {
            const noticeId = parseInt(req.params.id, 10);
            const { notice } = await this.noticeUseCase.getNoticeDetail(noticeId);

            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.json(notice);
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                currentPage: req.path,
                title: '공지사항 관리',
                notice: notice || null,
                user: req.session.user || null,
                isEdit: !!notice,
                error: null,
                formData: notice || {}
            });
        } catch (error) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ error: error.message });
            }
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 공지사항 수정을 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async updateAdminNotice(req, res) {
        try {
            const noticeId = parseInt(req.params.id, 10);
            const notice = await this.noticeUseCase.updateNotice(noticeId, req.body);

            res.json(notice);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * 관리자 공지사항 삭제를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async deleteAdminNotice(req, res) {
        try {
            const noticeId = parseInt(req.params.id, 10);
            await this.noticeUseCase.deleteNotice(noticeId);

            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default NoticeController;
