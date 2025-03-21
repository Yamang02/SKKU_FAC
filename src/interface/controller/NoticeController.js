import NoticeUseCase from '../../application/notice/NoticeUseCase.js';
import NoticeDomainService from '../../domain/notice/service/NoticeDomainService.js';
import NoticeRepositoryImpl from '../../infrastructure/repository/NoticeRepositoryImpl.js';
import CommentDomainService from '../../domain/comment/service/CommentDomainService.js';
import CommentRepositoryImpl from '../../infrastructure/repository/CommentRepositoryImpl.js';

class NoticeController {
    constructor() {
        const noticeRepository = new NoticeRepositoryImpl();
        const commentRepository = new CommentRepositoryImpl();

        const noticeDomainService = new NoticeDomainService(noticeRepository);
        const commentDomainService = new CommentDomainService(commentRepository);

        this.noticeUseCase = new NoticeUseCase(noticeDomainService, commentDomainService);

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
            const searchType = req.query.searchType || 'all';
            const keyword = req.query.keyword || '';
            const page = parseInt(req.query.page, 10) || 1;
            const limit = 10;

            const result = await this.noticeUseCase.getNoticeList({
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
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({ error: error.message });
            }
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

            const { notice, comments, commentPagination } = await this.noticeUseCase.getNoticeDetail(noticeId, commentPage);

            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.json({ notice, comments });
            }

            res.render('notice/NoticeDetail', {
                title: notice.title,
                notice,
                comments,
                commentPagination,
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

            res.render('notice/NoticeForm', {
                title: '공지사항 작성',
                error: error.message,
                formData: req.body
            });
        }
    }

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

            res.render('notice/NoticeForm', {
                title: '공지사항 수정',
                error: error.message,
                formData: { ...req.body, id: req.params.id }
            });
        }
    }

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

            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }
}

export default NoticeController;
