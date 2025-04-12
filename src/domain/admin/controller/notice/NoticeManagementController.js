import { ViewPath } from '../../../../common/constants/ViewPath.js';
import ViewResolver from '../../../../common/utils/ViewResolver.js';
import NoticeManagementService from '../../service/notice/NoticeManagementService.js';

export default class NoticeManagementController {
    constructor() {
        this.noticeManagementService = new NoticeManagementService();
    }

    /**
     * 관리자 공지사항 목록 페이지를 렌더링합니다.
     */
    async getManagementNoticeList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const noticeListData = await this.noticeManagementService.getNoticeList({ page, limit });

            ViewResolver.render(res, ViewPath.ADMIN.NOTICE.LIST, {
                title: '공지사항 관리',
                breadcrumb: '공지사항 관리',
                currentPage: 'notice',
                ...noticeListData
            });
        } catch (error) {
            console.error('공지사항 목록 조회 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 공지사항 등록 페이지를 렌더링합니다.
     */
    async getManagementNoticeRegistrationPage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.ADMIN.NOTICE.REGISTRATION, {
                title: '공지사항 등록',
                breadcrumb: '공지사항 등록',
                currentPage: 'notice'
            });
        } catch (error) {
            console.error('공지사항 등록 페이지 렌더링 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 공지사항을 등록합니다.
     */
    async createManagementNotice(req, res) {
        try {
            const noticeData = req.body;

            await this.noticeManagementService.createNotice(noticeData);

            res.redirect('/admin/management/notice');
        } catch (error) {
            console.error('공지사항 등록 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 공지사항 상세 페이지를 렌더링합니다.
     */
    async getManagementNoticeDetail(req, res) {
        try {
            const noticeId = req.params.id;

            const noticeData = await this.noticeManagementService.getNoticeDetail(noticeId);

            ViewResolver.render(res, ViewPath.ADMIN.NOTICE.DETAIL, {
                title: '공지사항 상세',
                breadcrumb: '공지사항 상세',
                currentPage: 'notice',
                notice: noticeData
            });
        } catch (error) {
            console.error('공지사항 상세 조회 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 공지사항을 수정합니다.
     */
    async updateManagementNotice(req, res) {
        try {
            const noticeId = req.params.id;
            const noticeData = req.body;

            await this.noticeManagementService.updateNotice(noticeId, noticeData);

            res.redirect(`/admin/management/notice/${noticeId}`);
        } catch (error) {
            console.error('공지사항 수정 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 공지사항을 삭제합니다.
     */
    async deleteManagementNotice(req, res) {
        try {
            const noticeId = req.params.id;

            await this.noticeManagementService.deleteNotice(noticeId);

            res.redirect('/admin/management/notice');
        } catch (error) {
            console.error('공지사항 삭제 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }
}
