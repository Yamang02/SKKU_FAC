import ViewResolver from '../utils/ViewResolver.js';
import { ViewPath } from '../constants/ViewPath.js';
import NoticeRepository from '../repositories/NoticeRepository.js';
import Page from '../models/common/page/Page.js';

export default class NoticeController {
    constructor() {
        this.noticeRepository = new NoticeRepository();
    }

    // ===== 사용자용 메서드 =====
    /**
     * 공지사항 목록 페이지를 렌더링합니다.
     */
    async getNoticeList(req, res) {
        try {
            const { page = 1, limit = 10, searchType = 'all', keyword = '' } = req.query;
            const notices = await this.noticeRepository.findNotices({
                page,
                limit,
                searchType,
                keyword
            });

            const pageOptions = {
                page,
                limit,
                baseUrl: '/notice',
                filters: { searchType, keyword },
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(notices.total || 0, pageOptions);

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.LIST, {
                title: '공지사항',
                notices: notices.items || [],
                page: pageData,
                searchType,
                keyword
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
            const notice = await this.noticeRepository.findNoticeById(id);

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

    // ===== 관리자용 메서드 =====
    /**
     * 관리자용 공지사항 목록 페이지를 렌더링합니다.
     */
    async getManagementNoticeList(req, res) {
        try {
            const { page = 1, limit = 10, status, isImportant, keyword } = req.query;
            const filters = { status, isImportant, keyword };

            const notices = await this.noticeRepository.findNotices({
                page: parseInt(page),
                limit: parseInt(limit),
                ...filters
            });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.LIST, {
                title: '공지사항 관리',
                notices: notices.items || [],
                result: {
                    total: notices.total,
                    totalPages: Math.ceil(notices.total / limit)
                },
                page: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(notices.total / limit),
                    hasPreviousPage: parseInt(page) > 1,
                    hasNextPage: parseInt(page) < Math.ceil(notices.total / limit)
                },
                filters
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 공지사항 등록 페이지를 렌더링합니다.
     */
    async getManagementNoticeRegistrationPage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 등록',
                notice: null,
                mode: 'create',
                user: req.session.user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 공지사항을 등록합니다.
     */
    async createManagementNotice(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: '로그인이 필요합니다.'
                });
            }

            const noticeData = {
                ...req.body,
                author: req.session.user.name
            };

            const result = await this.noticeRepository.createNotice(noticeData);

            if (result) {
                res.json({
                    success: true,
                    message: '공지사항이 등록되었습니다.',
                    redirectUrl: '/admin/management/notice'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: '공지사항 등록에 실패했습니다.'
                });
            }
        } catch (error) {
            console.error('Error creating notice:', error);
            res.status(500).json({
                success: false,
                message: '공지사항 등록 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 공지사항 상세 페이지를 렌더링합니다.
     */
    async getManagementNoticeDetail(req, res) {
        try {
            const { id } = req.params;
            const notice = await this.noticeRepository.findNoticeById(id);

            if (!notice) {
                throw new Error('공지사항을 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 상세',
                notice,
                mode: 'edit',
                user: req.session.user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 공지사항을 수정합니다.
     */
    async updateManagementNotice(req, res) {
        try {
            const { id } = req.params;
            const noticeData = req.body;

            const result = await this.noticeRepository.updateNotice(id, noticeData);
            if (result) {
                res.json({ success: true, message: '공지사항이 수정되었습니다.' });
            } else {
                res.status(404).json({ success: false, message: '공지사항을 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error('Error updating notice:', error);
            res.status(500).json({ success: false, message: '공지사항 수정 중 오류가 발생했습니다.' });
        }
    }

    /**
     * 관리자용 공지사항을 삭제합니다.
     */
    async deleteManagementNotice(req, res) {
        try {
            const { id } = req.params;
            const result = await this.noticeRepository.deleteNotice(id);

            if (result) {
                res.json({ success: true, message: '공지사항이 삭제되었습니다.' });
            } else {
                res.status(404).json({ success: false, message: '공지사항을 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error('Error deleting notice:', error);
            res.status(500).json({ success: false, message: '공지사항 삭제 중 오류가 발생했습니다.' });
        }
    }
}
