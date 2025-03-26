/**
 * 공지사항 컨트롤러
 * 공지사항 관련 HTTP 요청을 처리합니다.
 */
class NoticeController {
    constructor(noticeService) {
        this.noticeService = noticeService;
    }

    /**
     * 공지사항 목록 페이지를 렌더링합니다.
     */
    async renderNoticeList(req, res) {
        try {
            const { page = 1, keyword, isImportant, status } = req.query;
            const limit = 10;
            const offset = (page - 1) * limit;

            const filters = {
                keyword,
                isImportant: isImportant === 'true',
                status,
                limit,
                offset
            };

            const { items: notices, total } = await this.noticeService.searchNoticesWithFilters(filters);
            const totalPages = Math.ceil(total / limit);

            res.render('admin/notice/list', {
                notices,
                currentPage: parseInt(page),
                totalPages,
                filters
            });
        } catch (error) {
            console.error('공지사항 목록 조회 중 오류:', error);
            res.status(500).render('error', { message: '공지사항 목록을 불러오는데 실패했습니다.' });
        }
    }

    /**
     * 공지사항 상세 페이지를 렌더링합니다.
     */
    async renderNoticeDetail(req, res) {
        try {
            const { id } = req.params;
            const notice = await this.noticeService.findById(id);

            if (!notice) {
                return res.status(404).render('error', { message: '공지사항을 찾을 수 없습니다.' });
            }

            await this.noticeService.incrementViews(id);

            res.render('admin/notice/detail', { notice });
        } catch (error) {
            console.error('공지사항 상세 조회 중 오류:', error);
            res.status(500).render('error', { message: '공지사항을 불러오는데 실패했습니다.' });
        }
    }

    /**
     * 공지사항 생성 페이지를 렌더링합니다.
     */
    renderCreateNotice(req, res) {
        res.render('admin/notice/create');
    }

    /**
     * 공지사항을 생성합니다.
     */
    async createNotice(req, res) {
        try {
            const noticeData = {
                ...req.body,
                author: req.user.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await this.noticeService.create(noticeData);
            res.redirect('/admin/notices');
        } catch (error) {
            console.error('공지사항 생성 중 오류:', error);
            res.status(500).render('error', { message: '공지사항 생성에 실패했습니다.' });
        }
    }

    /**
     * 공지사항 수정 페이지를 렌더링합니다.
     */
    async renderEditNotice(req, res) {
        try {
            const { id } = req.params;
            const notice = await this.noticeService.findById(id);

            if (!notice) {
                return res.status(404).render('error', { message: '공지사항을 찾을 수 없습니다.' });
            }

            res.render('admin/notice/edit', { notice });
        } catch (error) {
            console.error('공지사항 수정 페이지 로드 중 오류:', error);
            res.status(500).render('error', { message: '공지사항 수정 페이지를 불러오는데 실패했습니다.' });
        }
    }

    /**
     * 공지사항을 수정합니다.
     */
    async updateNotice(req, res) {
        try {
            const { id } = req.params;
            const updateData = {
                ...req.body,
                updatedAt: new Date().toISOString()
            };

            const notice = await this.noticeService.update(id, updateData);
            if (!notice) {
                return res.status(404).render('error', { message: '공지사항을 찾을 수 없습니다.' });
            }

            res.redirect(`/admin/notices/${id}`);
        } catch (error) {
            console.error('공지사항 수정 중 오류:', error);
            res.status(500).render('error', { message: '공지사항 수정에 실패했습니다.' });
        }
    }

    /**
     * 공지사항을 삭제합니다.
     */
    async deleteNotice(req, res) {
        try {
            const { id } = req.params;
            const result = await this.noticeService.delete(id);

            if (!result) {
                return res.status(404).render('error', { message: '공지사항을 찾을 수 없습니다.' });
            }

            res.redirect('/admin/notices');
        } catch (error) {
            console.error('공지사항 삭제 중 오류:', error);
            res.status(500).render('error', { message: '공지사항 삭제에 실패했습니다.' });
        }
    }
}

export default NoticeController;
