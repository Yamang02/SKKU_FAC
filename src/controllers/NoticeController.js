import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import NoticeRepository from '../repositories/NoticeRepository.js';

export default class NoticeController {
    constructor() {
        this.noticeRepository = new NoticeRepository();
    }

    /**
     * 공지사항 목록 페이지를 렌더링합니다.
     */
    async getNoticeList(req, res) {
        try {
            const { page = 1, limit = 12, search } = req.query;
            const notices = await this.noticeRepository.findNotices({ page, limit, search });

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.LIST, {
                title: '공지사항',
                notices,
                currentPage: page,
                totalPages: Math.ceil(notices.total / limit)
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항 상세 페이지를 렌더링합니다.
     */
    async getNoticeDetail(req, res) {
        try {
            const { id } = req.params;
            const notice = await this.noticeRepository.findById(id);
            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.DETAIL, {
                title: notice.title,
                notice
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항 작성 페이지를 렌더링합니다.
     */
    async getNoticeCreatePage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 작성',
                isCreate: true
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항 수정 페이지를 렌더링합니다.
     */
    async getNoticeEditPage(req, res) {
        try {
            const { id } = req.params;
            const notice = await this.noticeRepository.findById(id);
            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 수정',
                notice,
                isEdit: true
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 공지사항 목록 페이지를 렌더링합니다.
     */
    async getAdminNoticeList(req, res) {
        try {
            const { page = 1, limit = 12, search } = req.query;
            const notices = await this.noticeRepository.findNotices({ page, limit, search });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.LIST, {
                title: '공지사항 관리',
                notices,
                currentPage: page,
                totalPages: Math.ceil(notices.total / limit)
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 공지사항 상세 페이지를 렌더링합니다.
     */
    async getAdminNoticeDetail(req, res) {
        try {
            const { id } = req.params;
            const notice = await this.noticeRepository.findById(id);
            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 상세',
                notice
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항을 생성합니다.
     */
    async createNotice(req, res) {
        try {
            const noticeData = req.body;
            await this.noticeRepository.create(noticeData);
            res.redirect('/admin/management/notice');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항을 수정합니다.
     */
    async updateNotice(req, res) {
        try {
            const { id } = req.params;
            const noticeData = req.body;
            await this.noticeRepository.update(id, noticeData);
            res.redirect('/admin/management/notice');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 공지사항을 삭제합니다.
     */
    async deleteNotice(req, res) {
        try {
            const { id } = req.params;
            await this.noticeRepository.delete(id);
            res.redirect('/admin/management/notice');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }
}
