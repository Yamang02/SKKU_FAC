import { ApiResponse } from '#domain/common/model/ApiResponse.js';
import ArtworkRequestDto from '#domain/artwork/model/dto/ArtworkRequestDto.js';
import ArtworkResponseDto from '#domain/artwork/model/dto/ArtworkResponseDto.js';
import {
    ArtworkNotFoundError,
    ArtworkValidationError
} from '#common/error/ArtworkError.js';
import logger from '#common/utils/Logger.js';

/**
 * Artwork Admin API Controller
 * 작품 관리를 위한 RESTful API 엔드포인트 제공
 */
export default class ArtworkAdminApiController {
    static dependencies = ['ArtworkAdminService'];

    constructor(artworkAdminService) {
        this.artworkAdminService = artworkAdminService;
    }

    /**
     * GET /api/admin/artworks
     * 작품 목록 조회 (페이지네이션, 필터링, 정렬 지원)
     */
    async getArtworkList(req, res) {
        try {
            const { page = 1, limit = 20, keyword, status, isFeatured, sortField, sortOrder } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                keyword,
                status,
                isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
                sortField,
                sortOrder
            };

            const result = await this.artworkAdminService.getArtworkList(options);

            return res.status(200).json(
                ApiResponse.success('작품 목록을 성공적으로 조회했습니다.', result)
            );
        } catch (error) {
            logger.error('작품 목록 조회 실패:', error);
            return res.status(500).json(
                ApiResponse.error('작품 목록 조회에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * GET /api/admin/artworks/:id
     * 특정 작품 상세 정보 조회
     */
    async getArtworkDetail(req, res) {
        try {
            const { id } = req.params;

            const artwork = await this.artworkAdminService.getArtworkDetail(id);

            return res.status(200).json(
                ApiResponse.success('작품 정보를 성공적으로 조회했습니다.', artwork)
            );
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('작품을 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('작품 상세 조회 실패:', error);
            return res.status(500).json(
                ApiResponse.error('작품 정보 조회에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * POST /api/admin/artworks
     * 새 작품 생성
     */
    async createArtwork(req, res) {
        try {
            const artworkDto = new ArtworkRequestDto();

            // 기본 데이터 설정
            artworkDto.title = req.body.title;
            artworkDto.medium = req.body.medium;
            artworkDto.size = req.body.size;
            artworkDto.year = req.body.year;
            artworkDto.description = req.body.description;
            artworkDto.userId = req.body.userId;
            artworkDto.exhibitionId = req.body.exhibitionId;

            // 이미지 파일 처리
            const files = req.files || [];

            const newArtwork = await this.artworkAdminService.createArtwork(artworkDto, files);
            const artworkResponseDto = new ArtworkResponseDto(newArtwork);

            return res.status(201).json(ApiResponse.success(artworkResponseDto, 'Artwork created successfully'));

        } catch (error) {
            logger.withContext(req).error('Error creating artwork:', error);

            if (error instanceof ArtworkValidationError) {
                return res.status(400).json(ApiResponse.error('Validation failed'));
            }
            return res.status(500).json(ApiResponse.error('Failed to create artwork'));
        }
    }

    /**
     * PUT /api/admin/artworks/:id
     * 작품 정보 업데이트
     */
    async updateArtwork(req, res) {
        try {
            const { id } = req.params;
            const artworkData = req.body;

            const updatedArtwork = await this.artworkAdminService.updateArtwork(id, artworkData);

            return res.status(200).json(
                ApiResponse.success('작품 정보가 성공적으로 수정되었습니다.', updatedArtwork)
            );
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('작품을 찾을 수 없습니다.', error.message)
                );
            }

            if (error instanceof ArtworkValidationError) {
                return res.status(400).json(
                    ApiResponse.error('입력 데이터가 유효하지 않습니다.', error.message)
                );
            }

            logger.error('작품 정보 수정 실패:', error);
            return res.status(500).json(
                ApiResponse.error('작품 정보 수정에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * DELETE /api/admin/artworks/:id
     * 작품 삭제
     */
    async deleteArtwork(req, res) {
        try {
            const { id } = req.params;

            const success = await this.artworkAdminService.deleteArtwork(id);

            if (success) {
                return res.status(200).json(
                    ApiResponse.success('작품이 성공적으로 삭제되었습니다.')
                );
            } else {
                return res.status(400).json(
                    ApiResponse.error('작품 삭제에 실패했습니다.')
                );
            }
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('작품을 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('작품 삭제 실패:', error);
            return res.status(500).json(
                ApiResponse.error('작품 삭제에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * PUT /api/admin/artworks/:id/approve
     * 작품 승인
     */
    async approveArtwork(req, res) {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                return res.status(400).json(ApiResponse.error('Invalid artwork ID'));
            }

            const approvedArtwork = await this.artworkAdminService.approveArtwork(parseInt(id), {
                approvedBy: req.user?.id,
                comment
            });

            if (!approvedArtwork) {
                return res.status(404).json(ApiResponse.error('Artwork not found'));
            }

            const artworkResponseDto = new ArtworkResponseDto(approvedArtwork);
            return res.json(ApiResponse.success(artworkResponseDto, 'Artwork approved successfully'));

        } catch (error) {
            logger.withContext(req).error('Error approving artwork:', error);

            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error('Artwork not found'));
            }
            return res.status(500).json(ApiResponse.error('Failed to approve artwork'));
        }
    }

    /**
     * PUT /api/admin/artworks/:id/reject
     * 작품 거부
     */
    async rejectArtwork(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                return res.status(400).json(ApiResponse.error('Invalid artwork ID'));
            }

            if (!reason || reason.trim() === '') {
                return res.status(400).json(ApiResponse.error('Rejection reason is required'));
            }

            const rejectedArtwork = await this.artworkAdminService.rejectArtwork(parseInt(id), {
                rejectedBy: req.user?.id,
                reason
            });

            if (!rejectedArtwork) {
                return res.status(404).json(ApiResponse.error('Artwork not found'));
            }

            const artworkResponseDto = new ArtworkResponseDto(rejectedArtwork);
            return res.json(ApiResponse.success(artworkResponseDto, 'Artwork rejected successfully'));

        } catch (error) {
            logger.withContext(req).error('Error rejecting artwork:', error);

            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error('Artwork not found'));
            }
            return res.status(500).json(ApiResponse.error('Failed to reject artwork'));
        }
    }

    /**
     * GET /api/admin/artworks/stats
     * 작품 통계 정보 조회
     */
    async getArtworkStats(req, res) {
        try {
            const stats = await this.artworkAdminService.getArtworkStats();
            return res.json(ApiResponse.success(stats, 'Artwork statistics retrieved successfully'));

        } catch (error) {
            logger.withContext(req).error('Error getting artwork stats:', error);
            return res.status(500).json(ApiResponse.error('Failed to get artwork statistics'));
        }
    }

    /**
     * POST /api/admin/artworks/:id/upload-image
     * 작품 이미지 업로드
     */
    async uploadArtworkImage(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
                return res.status(400).json(ApiResponse.error('Invalid artwork ID'));
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json(ApiResponse.error('No image files provided'));
            }

            const result = await this.artworkAdminService.uploadArtworkImages(parseInt(id), req.files);

            if (!result) {
                return res.status(404).json(ApiResponse.error('Artwork not found'));
            }

            return res.json(ApiResponse.success(result, 'Images uploaded successfully'));

        } catch (error) {
            logger.withContext(req).error('Error uploading artwork images:', error);

            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error('Artwork not found'));
            }
            return res.status(500).json(ApiResponse.error('Failed to upload artwork images'));
        }
    }

    /**
     * 작품 상태 업데이트 API (승인/거부)
     * PUT /api/admin/artworks/:id/status
     */
    async updateArtworkStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status || !['PENDING', 'APPROVED', 'BLOCKED', 'DELETED'].includes(status)) {
                return res.status(400).json(
                    ApiResponse.error('유효한 상태값이 필요합니다. (PENDING, APPROVED, BLOCKED, DELETED)')
                );
            }

            const updatedArtwork = await this.artworkAdminService.updateArtworkStatus(id, status);

            return res.status(200).json(
                ApiResponse.success('작품 상태가 성공적으로 변경되었습니다.', updatedArtwork)
            );
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('작품을 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('작품 상태 업데이트 실패:', error);
            return res.status(500).json(
                ApiResponse.error('작품 상태 업데이트에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 작품 주요 작품 설정 토글 API
     * POST /api/admin/artworks/:id/toggle-featured
     */
    async toggleFeatured(req, res) {
        try {
            const { id } = req.params;

            const updatedArtwork = await this.artworkAdminService.toggleFeatured(id);

            return res.status(200).json(
                ApiResponse.success('작품 주요 작품 설정이 성공적으로 변경되었습니다.', updatedArtwork)
            );
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(
                    ApiResponse.error('작품을 찾을 수 없습니다.', error.message)
                );
            }

            logger.error('작품 주요 작품 설정 실패:', error);
            return res.status(500).json(
                ApiResponse.error('작품 주요 작품 설정에 실패했습니다.', error.message)
            );
        }
    }

    /**
     * 작품 폼 데이터 조회 API (작품 생성/수정 폼용)
     * GET /api/admin/artworks/form-data
     */
    async getArtworkFormData(req, res) {
        try {
            const formData = await this.artworkAdminService.getArtworkFormData();

            return res.status(200).json(
                ApiResponse.success('작품 폼 데이터를 성공적으로 조회했습니다.', formData)
            );
        } catch (error) {
            logger.error('작품 폼 데이터 조회 실패:', error);
            return res.status(500).json(
                ApiResponse.error('작품 폼 데이터 조회에 실패했습니다.', error.message)
            );
        }
    }
}
