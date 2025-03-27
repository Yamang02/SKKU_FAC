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

    /**
     * 전시회 목록 페이지를 렌더링합니다.
     */
    async getExhibitionList(req, res) {
        try {
            const { page = 1, limit = 12, sortField = 'startDate', sortOrder = 'desc', searchType, keyword } = req.query;
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

            const pageData = new Page(exhibitions.total, pageOptions);

            ViewResolver.render(res, ViewPath.MAIN.EXHIBITION.LIST, {
                title: '전시회 목록',
                exhibitions: exhibitions.items || [],
                page: pageData,
                searchType,
                keyword,
                sortField,
                sortOrder
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
            const exhibition = await this.exhibitionRepository.findById(id);
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

    /**
     * 전시회 생성 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    getExhibitionCreatePage(req, res) {
        ViewResolver.render(res, ViewPath.EXHIBITION.CREATE, {
            title: '전시회 생성'
        });
    }

    /**
     * 전시회를 생성합니다.
     */
    async createExhibition(req, res) {
        try {
            const exhibitionData = req.body;
            await this.exhibitionRepository.create(exhibitionData);
            res.redirect('/admin/management/exhibition');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 전시회 수정 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getExhibitionEditPage(req, res) {
        try {
            const exhibition = await this.exhibitionRepository.findExhibitionById(req.params.id);
            if (!exhibition) {
                throw new Error('전시회를 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.EXHIBITION.EDIT, {
                title: '전시회 수정',
                exhibition
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 전시회를 수정합니다.
     */
    async updateExhibition(req, res) {
        try {
            const { id } = req.params;
            const exhibitionData = req.body;
            await this.exhibitionRepository.update(id, exhibitionData);
            res.redirect('/admin/management/exhibition');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 전시회를 삭제합니다.
     */
    async deleteExhibition(req, res) {
        try {
            const { id } = req.params;
            await this.exhibitionRepository.delete(id);
            res.redirect('/admin/management/exhibition');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 전시회 목록 페이지를 렌더링합니다.
     */
    async getManagementExhibitionList(req, res) {
        try {
            const { page = 1, limit = 12, sortField = 'createdAt', sortOrder = 'desc', search } = req.query;
            const exhibitions = await this.exhibitionRepository.findExhibitions({ page, limit, sortField, sortOrder, search });

            const pageOptions = {
                page,
                limit,
                baseUrl: '/admin/management/exhibition',
                sortField,
                sortOrder,
                filters: { search },
                previousUrl: Page.getPreviousPageUrl(req),
                currentUrl: Page.getCurrentPageUrl(req)
            };

            const pageData = new Page(exhibitions.total, pageOptions);

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.LIST, {
                title: '전시회 관리',
                exhibitions: exhibitions.items || [],
                page: pageData,
                search
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자용 전시회 상세 페이지를 렌더링합니다.
     */
    async getManagementExhibitionDetail(req, res) {
        try {
            const { id } = req.params;
            console.log('요청된 전시회 ID:', id);

            const exhibition = await this.exhibitionRepository.findExhibitionById(id);
            console.log('조회된 전시회 정보:', exhibition);

            if (!exhibition) {
                throw new Error('전시회를 찾을 수 없습니다.');
            }

            ViewResolver.render(res, ViewPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL, {
                title: '전시회 상세',
                exhibition
            });
        } catch (error) {
            console.error('전시회 상세 조회 중 에러 발생:', error);
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 관리자 전시회 삭제를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async deleteAdminExhibition(req, res) {
        try {
            const { id } = req.params;
            await this.exhibitionRepository.deleteExhibition(parseInt(id));
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
