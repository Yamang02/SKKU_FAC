import { ViewPath } from '../../../common/constants/ViewPath.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import ExhibitionService from '../service/ExhibitionService.js';
import Page from '../../common/model/Page.js';
import { ExhibitionError, ExhibitionNotFoundError } from '../../../common/error/ExhibitionError.js';
import { Message } from '../../../common/constants/Message.js';

/**
 * 전시회 컨트롤러
 * HTTP 요청을 처리하고 서비스 계층과 연결합니다.
 */
export default class ExhibitionController {
    constructor() {
        this.exhibitionService = new ExhibitionService();
    }


    // ===== 사용자용 메서드 =====
    /**
     * 전시회 목록 페이지를 렌더링합니다.
     */
    async getExhibitionListPage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.MAIN.EXHIBITION.LIST, {
                title: '전시회 목록',
                exhibitions: []
            });
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }


    // ===== 관리자용 메서드 =====
    /**
     * 관리자용 전시회 목록 페이지를 렌더링합니다.
     */
    async getManagementExhibitionListPage(req, res) {
        try {
            const { page = 1, limit = 10, keyword, exhibitionType } = req.query;
            const filters = { keyword, exhibitionType };

            const exhibitions = await this.exhibitionService.getAllExhibitions();

            const pageOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                baseUrl: '/admin/management/exhibition',
                filters
            };

            const pageData = new Page(exhibitions.length, pageOptions);

            return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.LIST, {
                title: '전시회 관리',
                exhibitions: exhibitions,
                result: {
                    total: exhibitions.length,
                    totalPages: Math.ceil(exhibitions.length / limit)
                },
                page: pageData,
                filters
            });
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 전시회 등록 페이지를 렌더링합니다.
     */
    async getManagementExhibitionCreatePage(req, res) {
        try {
            return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 등록',
                exhibition: null,
                mode: 'create',
                user: req.user
            });
        } catch (error) {
            return ViewResolver.renderError(res, error);
        }
    }


    /**
     * 관리자용 전시회 상세 페이지를 렌더링합니다.
     */
    async getManagementExhibitionDetailPage(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionService.getExhibitionById(id);

            return ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 상세',
                exhibition,
                mode: 'edit',
                user: req.user
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return ViewResolver.renderError(res, error);
            }
            return ViewResolver.renderError(res, new ExhibitionError(Message.EXHIBITION.DETAIL_ERROR));
        }
    }

}
