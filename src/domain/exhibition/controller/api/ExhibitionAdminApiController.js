import { ApiResponse } from '#domain/common/model/ApiResponse.js';
import { ExhibitionNotFoundError, ExhibitionValidationError } from '#common/error/ExhibitionError.js';
import logger from '#common/utils/Logger.js';

export default class ExhibitionAdminApiController {
    static dependencies = ['ExhibitionAdminService'];

    constructor(exhibitionAdminService) {
        this.exhibitionAdminService = exhibitionAdminService;
    }

    /**
     * 전시회 목록 조회 API
     * GET /api/admin/exhibitions
     */
    async getExhibitionList(req, res) {
        try {
            const { page = 1, limit = 20, exhibitionType, isFeatured, year, keyword } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                exhibitionType,
                isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
                year: year ? parseInt(year) : undefined,
                keyword
            };

            const result = await this.exhibitionAdminService.getExhibitionList(options);

            return res.status(200).json(
                ApiResponse.success('전시회 목록을 성공적으로 조회했습니다.', result)
            );
        } catch (error) {
            logger.error('전시회 목록 조회 실패:', error);
            return res.status(500).json(
                ApiResponse.error('전시회 목록 조회에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 전시회 상세 조회 API
     * GET /api/admin/exhibitions/:id
     */
    async getExhibitionDetail(req, res) {
        try {
            const { id } = req.params;

            const exhibition = await this.exhibitionAdminService.getExhibitionDetail(id);

            return res.status(200).json(
                ApiResponse.success('전시회 정보를 성공적으로 조회했습니다.', exhibition)
            );
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('전시회를 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('전시회 상세 조회 실패:', error);
            return res.status(500).json(
                ApiResponse.error('전시회 정보 조회에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 전시회 생성 API (관리자만 가능)
     * POST /api/admin/exhibitions
     */
    async createExhibition(req, res) {
        try {
            const exhibitionData = req.body;
            const exhibitionImage = req.file; // 단일 이미지 업로드

            if (!exhibitionImage) {
                return res.status(400).json(
                    ApiResponse.error('전시회 이미지가 필요합니다.')
                );
            }

            const imageInfo = {
                url: exhibitionImage.path,
                publicId: exhibitionImage.filename
            };

            const newExhibition = await this.exhibitionAdminService.createExhibition(exhibitionData, imageInfo);

            return res.status(201).json(
                ApiResponse.success('전시회가 성공적으로 생성되었습니다.', newExhibition)
            );
        } catch (error) {
            if (error instanceof ExhibitionValidationError) {
                return res.status(400).json(
                    ApiResponse.error('입력 데이터가 유효하지 않습니다.', error.message)
                );
            }

            logger.error('전시회 생성 실패:', error);
            return res.status(500).json(
                ApiResponse.error('전시회 생성에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 전시회 정보 수정 API
     * PUT /api/admin/exhibitions/:id
     */
    async updateExhibition(req, res) {
        try {
            const { id } = req.params;
            const exhibitionData = req.body;

            const success = await this.exhibitionAdminService.updateExhibition(id, exhibitionData);

            if (success) {
                return res.status(200).json(
                    ApiResponse.success('전시회 정보가 성공적으로 수정되었습니다.')
                );
            } else {
                return res.status(400).json(
                    ApiResponse.error('전시회 정보 수정에 실패했습니다.')
                );
            }
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('전시회를 찾을 수 없습니다.', error.message)
                );
            }

            if (error instanceof ExhibitionValidationError) {
                return res.status(400).json(
                    ApiResponse.error('입력 데이터가 유효하지 않습니다.', error.message)
                );
            }

            logger.error('전시회 정보 수정 실패:', error);
            return res.status(500).json(
                ApiResponse.error('전시회 정보 수정에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 전시회 삭제 API
     * DELETE /api/admin/exhibitions/:id
     */
    async deleteExhibition(req, res) {
        try {
            const { id } = req.params;

            const success = await this.exhibitionAdminService.deleteExhibition(id);

            if (success) {
                return res.status(200).json(
                    ApiResponse.success('전시회가 성공적으로 삭제되었습니다.')
                );
            } else {
                return res.status(400).json(
                    ApiResponse.error('전시회 삭제에 실패했습니다.')
                );
            }
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('전시회를 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('전시회 삭제 실패:', error);
            return res.status(500).json(
                ApiResponse.error('전시회 삭제에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 전시회 주요 전시 설정 토글 API
     * POST /api/admin/exhibitions/:id/toggle-featured
     */
    async toggleFeatured(req, res) {
        try {
            const { id } = req.params;

            const updatedExhibition = await this.exhibitionAdminService.toggleFeatured(id);

            return res.status(200).json(
                ApiResponse.success('전시회 주요 전시 설정이 성공적으로 변경되었습니다.', updatedExhibition)
            );
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('전시회를 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('전시회 주요 전시 설정 실패:', error);
            return res.status(500).json(
                ApiResponse.error('전시회 주요 전시 설정에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 전시회 상태 변경 API
     * PUT /api/admin/exhibitions/:id/status
     */
    async changeExhibitionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, options = {} } = req.body;

            if (!status) {
                return res.status(400).json(
                    ApiResponse.error('변경할 상태값이 필요합니다.')
                );
            }

            const updatedExhibition = await this.exhibitionAdminService.changeExhibitionStatus(id, status, options);

            return res.status(200).json(
                ApiResponse.success('전시회 상태가 성공적으로 변경되었습니다.', updatedExhibition)
            );
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('전시회를 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('전시회 상태 변경 실패:', error);
            return res.status(500).json(
                ApiResponse.error('전시회 상태 변경에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 전시회 제출 상태 업데이트 API
     * PUT /api/admin/exhibitions/:id/submission-status
     */
    async updateSubmissionStatus(req, res) {
        try {
            const { id } = req.params;
            const { isOpen } = req.body;

            if (typeof isOpen !== 'boolean') {
                return res.status(400).json(
                    ApiResponse.error('제출 상태는 boolean 값이어야 합니다.')
                );
            }

            const updatedExhibition = await this.exhibitionAdminService.updateSubmissionStatus(id, isOpen);

            return res.status(200).json(
                ApiResponse.success('전시회 제출 상태가 성공적으로 변경되었습니다.', updatedExhibition)
            );
        } catch (error) {
            if (error instanceof ExhibitionNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('전시회를 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('전시회 제출 상태 업데이트 실패:', error);
            return res.status(500).json(
                ApiResponse.error('전시회 제출 상태 업데이트에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 상태별 전시회 조회 API
     * GET /api/admin/exhibitions/by-status/:status
     */
    async getExhibitionsByStatus(req, res) {
        try {
            const { status } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await this.exhibitionAdminService.getExhibitionsByStatus(status, options);

            return res.status(200).json(
                ApiResponse.success(`${status} 상태의 전시회 목록을 성공적으로 조회했습니다.`, result)
            );
        } catch (error) {
            logger.error('상태별 전시회 조회 실패:', error);
            return res.status(500).json(
                ApiResponse.error('상태별 전시회 조회에 실패했습니다.', error.message)
            );
        }
    }
}
