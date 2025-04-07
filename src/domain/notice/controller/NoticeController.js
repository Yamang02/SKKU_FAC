import ViewResolver from '../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../common/constants/ViewPath.js';
import NoticeService from '../service/NoticeService.js';
import { NoticeNotFoundError, NoticeValidationError, NoticePermissionError } from '../../../common/error/NoticeError.js';

export default class NoticeController {
    constructor() {
        this.noticeService = new NoticeService();
    }

    // ===== 사용자용 메서드 =====
    /**
     * 공지사항 목록 페이지를 렌더링합니다.
     */
    async getNoticeList(req, res) {
        try {
            const { notices, page } = await this.noticeService.getNoticeList({
                ...req.query,
                isManagement: false
            });

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.LIST, {
                title: '공지사항',
                notices,
                page,
                searchType: req.query.searchType || 'all',
                keyword: req.query.keyword || ''
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
            const notice = await this.noticeService.getNoticeDetail(
                req.params.id,
                req.session.id
            );

            ViewResolver.render(res, ViewPath.MAIN.NOTICE.DETAIL, {
                title: notice.title,
                notice
            });
        } catch (error) {
            if (error instanceof NoticeNotFoundError) {
                return ViewResolver.renderError(res, error, 404);
            }
            ViewResolver.renderError(res, error);
        }
    }

    // ===== 관리자용 메서드 =====
    /**
     * 관리자용 공지사항 목록 페이지를 렌더링합니다.
     */
    async getManagementNoticeList(req, res) {
        try {
            const { notices, page } = await this.noticeService.getNoticeList({
                ...req.query,
                isManagement: true,
                status: req.query.status || 'active'
            });

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.LIST, {
                title: '공지사항 관리',
                notices,
                page,
                filters: {
                    status: req.query.status || 'active',
                    isImportant: req.query.isImportant,
                    keyword: req.query.keyword
                }
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

            await this.noticeService.createNotice(
                req.body,
                req.session.user.id,
                req.session.user.name
            );

            res.json({
                success: true,
                message: '공지사항이 등록되었습니다.',
                redirectUrl: '/admin/management/notice'
            });
        } catch (error) {
            console.error('Error creating notice:', error);
            if (error instanceof NoticeValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message || '공지사항 등록 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 공지사항 상세 페이지를 렌더링합니다.
     */
    async getManagementNoticeDetail(req, res) {
        try {
            const notice = await this.noticeService.getNoticeDetail(
                req.params.id,
                null
            );

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.NOTICE.DETAIL, {
                title: '공지사항 상세',
                notice,
                mode: 'edit',
                user: req.session.user
            });
        } catch (error) {
            if (error instanceof NoticeNotFoundError) {
                return ViewResolver.renderError(res, error, 404);
            }
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 공지사항을 수정합니다.
     */
    async updateManagementNotice(req, res) {
        try {
            await this.noticeService.updateNotice(
                req.params.id,
                req.body,
                req.session.user.id,
                req.session.user.name
            );

            res.json({
                success: true,
                message: '공지사항이 수정되었습니다.'
            });
        } catch (error) {
            console.error('Error updating notice:', error);
            if (error instanceof NoticeNotFoundError) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error instanceof NoticeValidationError ||
                error instanceof NoticePermissionError) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message || '공지사항 수정 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 공지사항을 삭제합니다.
     */
    async deleteManagementNotice(req, res) {
        try {
            await this.noticeService.deleteNotice(
                req.params.id,
                req.session.user.id
            );

            res.json({
                success: true,
                message: '공지사항이 삭제되었습니다.'
            });
        } catch (error) {
            console.error('Error deleting notice:', error);
            if (error instanceof NoticeNotFoundError) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error instanceof NoticePermissionError) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message || '공지사항 삭제 중 오류가 발생했습니다.'
            });
        }
    }
}
