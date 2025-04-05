import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import ExhibitionService from '../services/exhibition/ExhibitionService.js';
import Page from '../models/common/page/Page.js';
import { ExhibitionError, ExhibitionNotFoundError } from '../models/common/error/ExhibitionError.js';
import { ApiResponse } from '../models/common/response/ApiResponse.js';
import { Message } from '../constants/Message.js';

/**
 * 전시회 컨트롤러
 * HTTP 요청을 처리하고 서비스 계층과 연결합니다.
 */
export default class ExhibitionController {
    constructor() {
        this.exhibitionService = new ExhibitionService();
    }

    // ===== API 메서드 =====
    /**
     * 출품 가능한 전시회 목록을 반환합니다.
     */
    async getSubmittableExhibitions(req, res) {
        try {
            const exhibitions = await this.exhibitionService.getSubmittableExhibitions();
            return ApiResponse.success(res, exhibitions);
        } catch (error) {
            console.error('Error getting submittable exhibitions:', error);
            return ApiResponse.error(res, 500, Message.EXHIBITION.SUBMITTABLE_LIST_ERROR);
        }
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

    /**
     * 전시회 목록 데이터를 조회합니다.
     */
    async getExhibitionList(req, res) {
        try {
            const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword } = req.query;
            const exhibitions = await this.exhibitionService.getAllExhibitions();

            const pageOptions = {
                page,
                limit,
                baseUrl: '/exhibition',
                sortField,
                sortOrder,
                filters: { searchType, keyword }
            };

            const pageData = new Page(exhibitions.length, pageOptions);

            // 작품 목록 페이지에서 사용할 수 있도록 필요한 정보만 포함
            const processedExhibitions = exhibitions.map(exhibition => ({
                id: exhibition.id,
                title: exhibition.title,
                image: exhibition.image || '/images/exhibition-placeholder.svg',
                artworkCount: exhibition.artworkCount || 0,
                startDate: exhibition.startDate,
                endDate: exhibition.endDate,
                description: exhibition.description,
                type: exhibition.type
            }));

            const responseData = {
                exhibitions: processedExhibitions,
                page: pageData,
                total: exhibitions.length
            };

            console.log('=== Exhibition API Response ===');
            console.log('Query Parameters:', req.query);
            console.log('Response Data:', JSON.stringify(responseData, null, 2));
            console.log('============================');

            return res.json(ApiResponse.success(responseData));
        } catch (error) {
            console.error('전시회 목록 조회 중 오류:', error);
            return res.status(500).json(ApiResponse.error(error.message));
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
     * 관리자용 전시회를 등록합니다.
     */
    async createManagementExhibition(req, res) {
        try {
            const exhibition = await this.exhibitionService.createExhibition(req.body);
            return ApiResponse.success(res, {
                message: Message.EXHIBITION.CREATE_SUCCESS,
                data: exhibition,
                redirectUrl: '/admin/management/exhibition'
            });
        } catch (error) {
            if (error instanceof ExhibitionError) {
                return ApiResponse.error(res, 400, error.message);
            }
            console.error('Error creating exhibition:', error);
            return ApiResponse.error(res, 500, Message.EXHIBITION.CREATE_ERROR);
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

    /**
     * 관리자용 전시회를 수정합니다.
     */
    async updateManagementExhibition(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionService.updateExhibition(id, req.body);
            return ApiResponse.success(res, {
                message: Message.EXHIBITION.UPDATE_SUCCESS,
                data: exhibition
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return ApiResponse.error(res, 404, error.message);
            }
            if (error instanceof ExhibitionError) {
                return ApiResponse.error(res, 400, error.message);
            }
            console.error('Error updating exhibition:', error);
            return ApiResponse.error(res, 500, Message.EXHIBITION.UPDATE_ERROR);
        }
    }

    /**
     * 관리자용 전시회를 삭제합니다.
     */
    async deleteManagementExhibition(req, res) {
        try {
            const { id } = req.params;
            await this.exhibitionService.deleteExhibition(id);
            return ApiResponse.success(res, {
                message: Message.EXHIBITION.DELETE_SUCCESS
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return ApiResponse.error(res, 404, error.message);
            }
            console.error('Error deleting exhibition:', error);
            return ApiResponse.error(res, 500, Message.EXHIBITION.DELETE_ERROR);
        }
    }

    async getExhibitionListData(req, res) {
        try {
            const { page = 1, limit = 10, keyword } = req.query;
            const exhibitions = await this.exhibitionService.getExhibitionList({
                page,
                limit,
                keyword
            });
            return res.json(ApiResponse.success(exhibitions));
        } catch (error) {
            return res.status(500).json(ApiResponse.error(Message.EXHIBITION.LIST_ERROR));
        }
    }
}
