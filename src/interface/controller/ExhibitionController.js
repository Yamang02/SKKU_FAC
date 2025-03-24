import ViewResolver from '../../presentation/view/ViewResolver.js';
import { ViewPath } from '../../presentation/view/ViewPath.js';
import _ExhibitionUseCase from '../../application/exhibition/ExhibitionUseCase.js';

/**
 * 전시회 컨트롤러
 * HTTP 요청을 처리하고 유스케이스와 연결합니다.
 */
export default class ExhibitionController {
    /**
     * @param {ExhibitionUseCase} exhibitionUseCase - 전시회 유스케이스
     */
    constructor(exhibitionUseCase) {
        this.exhibitionUseCase = exhibitionUseCase;
    }

    /**
     * 전시회 목록 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getExhibitionList(req, res) {
        try {
            const exhibitions = await this.exhibitionUseCase.findAll();
            ViewResolver.render(res, ViewPath.EXHIBITION.LIST, {
                exhibitions,
                title: '전시회 목록'
            });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 전시회 상세 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getExhibitionDetail(req, res) {
        try {
            const exhibition = await this.exhibitionUseCase.findById(req.params.id);
            if (!exhibition) {
                return ViewResolver.render(res, ViewPath.ERROR.ERROR, {
                    error: '전시회를 찾을 수 없습니다.'
                });
            }
            ViewResolver.render(res, ViewPath.EXHIBITION.DETAIL, { exhibition });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 전시회 생성 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getCreateExhibitionForm(req, res) {
        ViewResolver.render(res, ViewPath.EXHIBITION.CREATE);
    }

    /**
     * 전시회를 생성합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async createExhibition(req, res) {
        try {
            await this.exhibitionUseCase.create(req.body);
            res.redirect('/exhibitions');
        } catch (error) {
            ViewResolver.render(res, ViewPath.EXHIBITION.CREATE, { error });
        }
    }

    /**
     * 전시회 수정 페이지를 처리합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async getEditExhibitionForm(req, res) {
        try {
            const exhibition = await this.exhibitionUseCase.findById(req.params.id);
            if (!exhibition) {
                return ViewResolver.render(res, ViewPath.ERROR.ERROR, {
                    error: '전시회를 찾을 수 없습니다.'
                });
            }
            ViewResolver.render(res, ViewPath.EXHIBITION.EDIT, { exhibition });
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }

    /**
     * 전시회를 수정합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async updateExhibition(req, res) {
        try {
            await this.exhibitionUseCase.update(req.params.id, req.body);
            res.redirect('/exhibitions');
        } catch (error) {
            ViewResolver.render(res, ViewPath.EXHIBITION.EDIT, { error });
        }
    }

    /**
     * 전시회를 삭제합니다.
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async deleteExhibition(req, res) {
        try {
            await this.exhibitionUseCase.delete(req.params.id);
            res.redirect('/exhibitions');
        } catch (error) {
            ViewResolver.renderError(res, error);
        }
    }
}
