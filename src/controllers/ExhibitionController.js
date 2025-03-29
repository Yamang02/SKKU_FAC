import { ViewPath } from '../constants/ViewPath.js';
import ViewResolver from '../utils/ViewResolver.js';
import ExhibitionRepository from '../repositories/ExhibitionRepository.js';
import Page from '../models/common/page/Page.js';

/**
 * 전시회 컨트롤러
 * HTTP 요청을 처리하고 데이터베이스와 연결합니다.
 */
export default class ExhibitionController {
    constructor() {
        this.exhibitionRepository = new ExhibitionRepository();
    }

    // ===== 사용자용 메서드 =====
    /**
     * 전시회 목록 페이지를 렌더링합니다.
     */
    async getExhibitionList(req, res) {
        try {
            const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword } = req.query;
            const exhibitions = await this.exhibitionRepository.findExhibitions({ page, limit, sortField, sortOrder, searchType, keyword });

            const pageOptions = {
                page,
                limit,
                baseUrl: '/exhibition',
                sortField,
                sortOrder,
                filters: { searchType, keyword },
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(exhibitions.total || 0, pageOptions);

            ViewResolver.render(res, ViewPath.MAIN.EXHIBITION.LIST, {
                title: '전시회 목록',
                exhibitions: exhibitions && exhibitions.items ? exhibitions.items : [],
                page: pageData,
                searchType: searchType || '',
                keyword: keyword || '',
                sortField: sortField || 'createdAt',
                sortOrder: sortOrder || 'desc',
                total: exhibitions && exhibitions.total ? exhibitions.total : 0
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 전시회 상세 페이지를 렌더링합니다.
     */
    async getExhibitionDetail(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionRepository.findExhibitionById(id);

            if (!exhibition) {
                throw new Error('전시회를 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.MAIN.EXHIBITION.DETAIL, {
                title: exhibition.title,
                exhibition
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    // ===== 관리자용 메서드 =====
    /**
     * 관리자용 전시회 목록 페이지를 렌더링합니다.
     */
    async getManagementExhibitionList(req, res) {
        try {
            const { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', keyword, exhibitionType } = req.query;
            const filters = { keyword, exhibitionType };

            const exhibitions = await this.exhibitionRepository.findExhibitions({
                page: parseInt(page),
                limit: parseInt(limit),
                sortField,
                sortOrder,
                ...filters
            });

            const pageOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                baseUrl: '/admin/management/exhibition',
                filters,
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(exhibitions.total || 0, pageOptions);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.LIST, {
                title: '전시회 관리',
                exhibitions: exhibitions.items.map(exhibition => ({
                    ...exhibition,
                    isSubmissionOpen: exhibition.isSubmissionOpen || false
                })) || [],
                result: {
                    total: exhibitions.total,
                    totalPages: Math.ceil(exhibitions.total / limit)
                },
                page: pageData,
                filters
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 전시회 등록 페이지를 렌더링합니다.
     */
    async getManagementExhibitionRegistrationPage(req, res) {
        try {
            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 등록',
                exhibition: null,
                mode: 'create',
                user: req.user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 전시회를 등록합니다.
     */
    async createManagementExhibition(req, res) {
        try {
            const exhibitionData = req.body;
            const result = await this.exhibitionRepository.createExhibition(exhibitionData);

            if (result) {
                res.json({
                    success: true,
                    message: '전시회가 등록되었습니다.',
                    redirectUrl: '/admin/management/exhibition'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: '전시회 등록에 실패했습니다.'
                });
            }
        } catch (error) {
            console.error('Error creating exhibition:', error);
            res.status(500).json({
                success: false,
                message: '전시회 등록 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 관리자용 전시회 상세 페이지를 렌더링합니다.
     */
    async getManagementExhibitionDetail(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionRepository.findExhibitionById(id);

            if (!exhibition) {
                throw new Error('전시회를 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 상세',
                exhibition,
                mode: 'edit',
                user: req.user
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 전시회를 수정합니다.
     */
    async updateManagementExhibition(req, res) {
        try {
            const { id } = req.params;
            const exhibitionData = req.body;

            const result = await this.exhibitionRepository.updateExhibition(id, exhibitionData);
            if (result) {
                res.json({ success: true, message: '전시회가 수정되었습니다.' });
            } else {
                res.status(404).json({ success: false, message: '전시회를 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error('Error updating exhibition:', error);
            res.status(500).json({ success: false, message: '전시회 수정 중 오류가 발생했습니다.' });
        }
    }

    /**
     * 관리자용 전시회를 삭제합니다.
     */
    async deleteManagementExhibition(req, res) {
        try {
            const { id } = req.params;
            const result = await this.exhibitionRepository.deleteExhibition(id);

            if (result) {
                res.json({ success: true, message: '전시회가 삭제되었습니다.' });
            } else {
                res.status(404).json({ success: false, message: '전시회를 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error('Error deleting exhibition:', error);
            res.status(500).json({ success: false, message: '전시회 삭제 중 오류가 발생했습니다.' });
        }
    }
}
