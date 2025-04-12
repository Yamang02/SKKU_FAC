import { ViewPath } from '../../../../common/constants/ViewPath.js';
import ViewResolver from '../../../../common/utils/ViewResolver.js';
import ExhibitionManagementService from '../../service/exhibition/ExhibitionManagementService.js';

export default class ExhibitionManagementController {
    constructor() {
        this.exhibitionManagementService = new ExhibitionManagementService();
    }

    /**
     * 관리자 전시회 목록 페이지를 렌더링합니다.
     */
    async getManagementExhibitionListPage(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const exhibitionListData = await this.exhibitionManagementService.getExhibitionList({ page, limit });

            ViewResolver.render(res, ViewPath.ADMIN.EXHIBITION.LIST, {
                title: '전시회 관리',
                breadcrumb: '전시회 관리',
                currentPage: 'exhibition',
                ...exhibitionListData
            });
        } catch (error) {
            console.error('전시회 목록 조회 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 전시회 생성 페이지를 렌더링합니다.
     */
    async getManagementExhibitionCreatePage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.ADMIN.EXHIBITION.CREATE, {
                title: '전시회 등록',
                breadcrumb: '전시회 등록',
                currentPage: 'exhibition'
            });
        } catch (error) {
            console.error('전시회 등록 페이지 렌더링 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 전시회를 생성합니다.
     */
    async createManagementExhibition(req, res) {
        try {
            const exhibitionData = req.body;

            await this.exhibitionManagementService.createExhibition(exhibitionData);

            res.redirect('/admin/management/exhibition');
        } catch (error) {
            console.error('전시회 등록 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 전시회 상세 페이지를 렌더링합니다.
     */
    async getManagementExhibitionDetailPage(req, res) {
        try {
            const exhibitionId = req.params.id;

            const exhibitionData = await this.exhibitionManagementService.getExhibitionDetail(exhibitionId);

            ViewResolver.render(res, ViewPath.ADMIN.EXHIBITION.DETAIL, {
                title: '전시회 상세',
                breadcrumb: '전시회 상세',
                currentPage: 'exhibition',
                exhibition: exhibitionData
            });
        } catch (error) {
            console.error('전시회 상세 조회 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 전시회를 수정합니다.
     */
    async updateManagementExhibition(req, res) {
        try {
            const exhibitionId = req.params.id;
            const exhibitionData = req.body;

            await this.exhibitionManagementService.updateExhibition(exhibitionId, exhibitionData);

            res.redirect(`/admin/management/exhibition/${exhibitionId}`);
        } catch (error) {
            console.error('전시회 수정 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 전시회를 삭제합니다.
     */
    async deleteManagementExhibition(req, res) {
        try {
            const exhibitionId = req.params.id;

            await this.exhibitionManagementService.deleteExhibition(exhibitionId);

            res.redirect('/admin/management/exhibition');
        } catch (error) {
            console.error('전시회 삭제 중 오류:', error);
            ViewResolver.renderError(res, error);
        }
    }
}
