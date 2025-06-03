import { ViewPath } from '../../../common/constants/ViewPath.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import ExhibitionService from '../service/ExhibitionService.js';
import { ExhibitionNotFoundError } from '../../../common/error/ExhibitionError.js';
import logger from '../../../common/utils/Logger.js';

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

    // ===== API 엔드포인트 =====
    /**
     * 전시회 목록을 조회합니다.
     */
    async getExhibitions(req, res) {
        try {
            const { page = 1, limit = 10, exhibitionType, isFeatured, year, search } = req.query;
            const options = { page: parseInt(page), limit: parseInt(limit) };

            if (exhibitionType) options.exhibitionType = exhibitionType;
            if (isFeatured !== undefined) options.isFeatured = isFeatured === 'true';
            if (year) options.year = parseInt(year);
            if (search) options.search = search;

            const result = await this.exhibitionService.getManagementExhibitions(options);

            res.json({
                success: true,
                data: result,
                message: '전시회 목록을 성공적으로 조회했습니다.'
            });
        } catch (error) {
            logger.error('전시회 목록 조회 실패:', error);
            res.status(500).json({
                success: false,
                message: '전시회 목록 조회 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    /**
     * 특정 전시회를 조회합니다.
     */
    async getExhibition(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionService.getExhibitionById(id);

            res.json({
                success: true,
                data: exhibition,
                message: '전시회 정보를 성공적으로 조회했습니다.'
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                res.status(404).json({
                    success: false,
                    message: '전시회를 찾을 수 없습니다.'
                });
            } else {
                logger.error('전시회 조회 실패:', error);
                res.status(500).json({
                    success: false,
                    message: '전시회 조회 중 오류가 발생했습니다.',
                    error: error.message
                });
            }
        }
    }

    /**
     * 새로운 전시회를 생성합니다.
     */
    async createExhibition(req, res) {
        try {
            const exhibitionData = req.body;
            const newExhibition = await this.exhibitionService.createManagementExhibition(exhibitionData);

            res.status(201).json({
                success: true,
                data: newExhibition,
                message: '전시회가 성공적으로 생성되었습니다.'
            });
        } catch (error) {
            logger.error('전시회 생성 실패:', error);
            res.status(400).json({
                success: false,
                message: '전시회 생성 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    /**
     * 전시회 정보를 수정합니다.
     */
    async updateExhibition(req, res) {
        try {
            const { id } = req.params;
            const exhibitionData = req.body;

            const updatedExhibition = await this.exhibitionService.updateManagementExhibition(id, exhibitionData);

            res.json({
                success: true,
                data: updatedExhibition,
                message: '전시회 정보가 성공적으로 수정되었습니다.'
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                res.status(404).json({
                    success: false,
                    message: '전시회를 찾을 수 없습니다.'
                });
            } else {
                logger.error('전시회 수정 실패:', error);
                res.status(400).json({
                    success: false,
                    message: '전시회 수정 중 오류가 발생했습니다.',
                    error: error.message
                });
            }
        }
    }

    /**
     * 전시회를 삭제합니다.
     */
    async deleteExhibition(req, res) {
        try {
            const { id } = req.params;
            await this.exhibitionService.deleteManagementExhibition(id);

            res.json({
                success: true,
                message: '전시회가 성공적으로 삭제되었습니다.'
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                res.status(404).json({
                    success: false,
                    message: '전시회를 찾을 수 없습니다.'
                });
            } else {
                logger.error('전시회 삭제 실패:', error);
                res.status(500).json({
                    success: false,
                    message: '전시회 삭제 중 오류가 발생했습니다.',
                    error: error.message
                });
            }
        }
    }

    /**
     * 전시회의 주요 전시회 상태를 토글합니다.
     */
    async toggleFeatured(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionService.getExhibitionById(id);

            const updatedExhibition = await this.exhibitionService.updateFeaturedStatus(id, !exhibition.isFeatured);

            res.json({
                success: true,
                data: updatedExhibition,
                message: `전시회가 ${updatedExhibition.isFeatured ? '주요 전시회로 설정' : '일반 전시회로 변경'}되었습니다.`
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                res.status(404).json({
                    success: false,
                    message: '전시회를 찾을 수 없습니다.'
                });
            } else {
                logger.error('전시회 상태 변경 실패:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || '전시회 상태 변경 중 오류가 발생했습니다.',
                    error: error.message
                });
            }
        }
    }

    /**
     * 전시회의 작품 제출 가능 상태를 토글합니다.
     */
    async toggleSubmissionOpen(req, res) {
        try {
            const { id } = req.params;
            const exhibition = await this.exhibitionService.getExhibitionById(id);

            const updatedExhibition = await this.exhibitionService.updateSubmissionStatus(id, !exhibition.isSubmissionOpen);

            res.json({
                success: true,
                data: updatedExhibition,
                message: `전시회 작품 제출이 ${updatedExhibition.isSubmissionOpen ? '열렸습니다' : '닫혔습니다'}.`
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                res.status(404).json({
                    success: false,
                    message: '전시회를 찾을 수 없습니다.'
                });
            } else {
                logger.error('전시회 제출 상태 변경 실패:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || '전시회 제출 상태 변경 중 오류가 발생했습니다.',
                    error: error.message
                });
            }
        }
    }

    /**
     * 전시회에 출품된 작품 목록을 조회합니다.
     */
    async getExhibitionArtworks(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // 전시회 존재 확인
            await this.exhibitionService.getExhibitionById(id);

            // 전시회 작품 목록 조회 (서비스에서 구현 필요)
            const artworks = await this.exhibitionService.getExhibitionArtworks(id, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                success: true,
                data: artworks,
                message: '전시회 작품 목록을 성공적으로 조회했습니다.'
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                res.status(404).json({
                    success: false,
                    message: '전시회를 찾을 수 없습니다.'
                });
            } else {
                logger.error('전시회 작품 목록 조회 실패:', error);
                res.status(500).json({
                    success: false,
                    message: '전시회 작품 목록 조회 중 오류가 발생했습니다.',
                    error: error.message
                });
            }
        }
    }

    /**
     * 전시회 상태와 함께 전시회 정보를 조회합니다.
     */
    async getExhibitionWithStatus(req, res) {
        try {
            const { id } = req.params;
            const exhibitionWithStatus = await this.exhibitionService.getExhibitionWithStatus(id);

            res.json({
                success: true,
                data: exhibitionWithStatus,
                message: '전시회 정보와 상태를 성공적으로 조회했습니다.'
            });
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                res.status(404).json({
                    success: false,
                    message: '전시회를 찾을 수 없습니다.'
                });
            } else {
                logger.error('전시회 상태 조회 실패:', error);
                res.status(500).json({
                    success: false,
                    message: '전시회 상태 조회 중 오류가 발생했습니다.',
                    error: error.message
                });
            }
        }
    }
}
