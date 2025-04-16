import ExhibitionService from '../../service/ExhibitionService.js';
import { ApiResponse } from '../../../common/model/ApiResponse.js';
import Page from '../../../common/model/Page.js';
import { ExhibitionError, ExhibitionNotFoundError } from '../../../../common/error/ExhibitionError.js';
import { Message } from '../../../../common/constants/Message.js';
// ===== API 메서드 =====
export default class ExhibitionApiController {
    constructor() {
        this.exhibitionService = new ExhibitionService();
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

    /**
     * 출품 가능한 전시회 목록을 반환합니다.
     */
    async findSubmittableExhibitions(req, res) {
        try {
            const exhibitions = await this.exhibitionService.findSubmittableExhibitions();
            res.json(ApiResponse.success(exhibitions));
        } catch (error) {
            console.error('Error getting submittable exhibitions:', error);
            res.status(500).json(ApiResponse.error(Message.EXHIBITION.SUBMITTABLE_LIST_ERROR));
        }
    }

    /**
     * 전시회 목록 데이터를 조회합니다.
     */
    async getExhibitionList(req, res) {
        try {


            const {
                page = 1,
                limit = 12,
                sortField = 'createdAt',
                sortOrder = 'desc',
                searchType = 'title',
                keyword = '',
                type = 'all',
                year = '',
                category = 'all',
                submission = 'all',
                sort = 'date-desc'
            } = req.query;

            // 정렬 조건 변환
            const sortOptions = {};
            if (sort) {
                const [field, order] = sort.split('-');
                if (field === 'date') {
                    sortOptions.sortField = 'start_date';
                } else if (field === 'title') {
                    sortOptions.sortField = 'title';
                } else {
                    sortOptions.sortField = 'created_at';
                }
                sortOptions.sortOrder = order === 'asc' ? 'ASC' : 'DESC';
            } else {
                sortOptions.sortField = sortField;
                sortOptions.sortOrder = sortOrder.toUpperCase();
            }

            // 필터 옵션 구성
            const filterOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                type: type !== 'all' ? type : undefined,
                year: year && year !== 'all' ? year : undefined,
                category: category !== 'all' ? category : undefined,
                isSubmissionOpen: submission === 'open' ? true : (submission === 'closed' ? false : undefined),
                keyword: keyword || undefined,
                searchType: searchType || 'title',
                ...sortOptions
            };

            // 필터링된 전시회 목록 조회 - 데이터베이스 레벨에서 필터링
            const exhibitions = await this.exhibitionService.getAllExhibitions(filterOptions);

            // 페이지네이션 정보 생성
            const pageOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                baseUrl: '/exhibition',
                ...sortOptions,
                filters: {
                    type,
                    year,
                    category,
                    submission,
                    keyword,
                    searchType
                }
            };

            const pageData = new Page(exhibitions.length, pageOptions);

            // 결과 데이터 구성
            const responseData = {
                exhibitions: exhibitions,
                page: pageData,
                total: exhibitions.length
            };

            return res.json(ApiResponse.success(responseData));
        } catch (error) {
            console.error('전시회 목록 조회 중 오류:', error);
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * 주요 전시회 목록을 조회합니다.
     */
    async getFeaturedExhibitions(req, res) {
        try {
            const limit = req.query.limit || 5;
            const exhibitions = await this.exhibitionService.getFeaturedExhibitions(limit);
            return res.json(ApiResponse.success(exhibitions));
        } catch (error) {
            console.error('주요 전시회 목록 조회 중 오류:', error);
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }

}

