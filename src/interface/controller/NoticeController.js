import NoticeUseCase from '../../application/notice/NoticeUseCase.js';
import NoticeService from '../../domain/notice/service/NoticeService.js';
import CommentService from '../../domain/comment/service/CommentService.js';

class NoticeController {
    constructor() {
        this.noticeService = new NoticeService();
        this.commentService = new CommentService();
        this.noticeUseCase = new NoticeUseCase(this.noticeService, this.commentService);

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

            res.render('notice/NoticeList', {
                title: '공지사항',
                searchType: req.query.searchType || 'all',
                keyword: req.query.keyword || '',
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
            const notice = await this.noticeService.findById(noticeId);
            const comments = await this.commentService.getCommentsByNoticeId(noticeId);

            // comments를 배열로 변환
            const commentsArray = Array.isArray(comments) ? comments : [];

            // 조회수 증가
            await this.noticeService.incrementViews(noticeId);

            const currentPage = parseInt(req.query.commentPage, 10) || 1;
            const itemsPerPage = 10;
            const totalItems = commentsArray.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            // 페이지 배열 생성 (예: [1, 2, 3, 4, 5])
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + 4);
            const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

            const pagination = {
                totalItems,
                currentPage,
                totalPages,
                itemsPerPage,
                pages,
                hasPrev: currentPage > 1,
                hasNext: currentPage < totalPages,
                showFirstPage: startPage > 1,
                showLastPage: endPage < totalPages,
                showFirstEllipsis: startPage > 2,
                showLastEllipsis: endPage < totalPages - 1
            };

            // 현재 페이지에 해당하는 댓글만 필터링
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentPageComments = commentsArray.slice(startIndex, endIndex);

            res.render('notice/NoticeDetail', {
                title: notice.title,
                notice,
                comments: currentPageComments,
                pagination,
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Error in getNoticeDetail:', error);
            res.render('common/error', {
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

            res.render('notice/NoticeForm', {
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

            res.render('notice/NoticeForm', {
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

            res.render('common/error', {
                title: '에러',
                message: error.message
            });
        }
    }
}

export default NoticeController;
