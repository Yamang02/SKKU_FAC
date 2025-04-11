import { Message } from '../../../../common/constants/Message.js';
import { ApiResponse } from '../../../common/model/ApiResponse.js';
import { ImageError } from '../../../../common/error/ImageError.js';
import ArtworkRequestDTO from '../../model/dto/ArtworkRequestDto.js';
import ArtworkService from '../../service/ArtworkService.js';
import ImageService from '../../../image/service/ImageService.js';
import {
    ArtworkNotFoundError,
    ArtworkValidationError
} from '../../../../common/error/ArtworkError.js';


export default class ArtworkApiController {
    constructor() {
        this.artworkService = new ArtworkService();
        this.imageService = new ImageService();
    }

    // === API 엔드포인트 ===
    /**
         * 관리자용 작품을 삭제합니다.
         */
    async deleteManagementArtwork(req, res) {
        try {
            const { id } = req.params;
            const result = await this.artworkService.deleteArtwork(id);

            if (result) {
                return res.json(ApiResponse.success(null, Message.ARTWORK.DELETE_SUCCESS));
            } else {
                return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
            }
        } catch (error) {
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.DELETE_ERROR));
        }
    }


    /**
        * 작품 목록을 조회합니다.
        */
    async getArtworkList(req, res) {
        try {
            const { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', ...filters } = req.query;

            // 작품 목록과 관련 정보를 함께 조회
            const result = await this.artworkService.getArtworkListWithDetails({
                page: Number(page),
                limit: Number(limit),
                sortField,
                sortOrder,
                ...filters
            });

            // 서비스에서 반환한 결과를 그대로 응답
            return res.json(ApiResponse.success(result));
        } catch (error) {
            console.error('작품 목록 조회 중 오류:', error);
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }


    /**
     * 추천 작품 목록을 조회합니다.
     */
    async getFeaturedArtworks(req, res) {
        try {
            const artworks = await this.artworkService.getFeaturedArtworks();
            return res.json(ApiResponse.success(artworks));
        } catch (error) {
            console.error('추천 작품 목록 조회 중 오류:', error);
            return res.status(500).json(ApiResponse.error(error.message));
        }
    }


    /**
     * 작품 상세 정보를 조회합니다.
     */
    async getArtworkDetail(req, res) {
        try {
            const slug = req.params.slug;
            const artwork = await this.artworkService.getArtworkDetailbySlug(slug);
            return res.json(ApiResponse.success(artwork));
        } catch (error) {
            return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
        }
    }


    /**
     * 작품을 등록합니다.
     */
    async createArtwork(req, res) {
        const file = req.file;
        const artworkData = req.body;

        try {
            // 세션 검사
            if (!req.session) {
                console.error('세션이 없습니다.');
                return res.status(401).json(ApiResponse.error('세션이 유효하지 않습니다. 다시 로그인해주세요.'));
            }

            // 사용자 정보 검사
            if (!req.session.user || !req.session.user.id) {
                console.error('사용자 정보가 없습니다:', req.session);
                return res.status(401).json(ApiResponse.error('로그인이 필요합니다.'));
            }


            // 파일 검사
            if (!file) {
                console.error('파일이 업로드되지 않았습니다.');
                return res.status(400).json(ApiResponse.error('이미지 파일이 필요합니다.'));
            }

            const artworkRequestDTO = new ArtworkRequestDTO();

            try {

                artworkRequestDTO.title = artworkData.title;
                artworkRequestDTO.userId = req.session.user.id;
                artworkRequestDTO.medium = artworkData.medium;
                artworkRequestDTO.size = artworkData.size;
                artworkRequestDTO.year = artworkData.year;
                artworkRequestDTO.description = artworkData.description;
                artworkRequestDTO.exhibitionId = artworkData.exhibitionId;

                const createdartwork = await this.artworkService.createArtwork(artworkRequestDTO, file);
                return res.status(201).json(ApiResponse.success(createdartwork, Message.ARTWORK.CREATE_SUCCESS));
            } catch (serviceError) {
                console.error('작품 서비스 처리 중 오류:', serviceError);
                // 서비스 오류 세부 정보 출력
                if (serviceError.stack) {
                    console.error('오류 스택:', serviceError.stack);
                }
                throw serviceError;
            }
        } catch (error) {
            console.error('작품 등록 중 오류 발생:', error);
            // 오류 스택 출력
            if (error.stack) {
                console.error('오류 스택:', error.stack);
            }
            // 업로드 이미지 삭제
            if (file) {
                await this.imageService.deleteImage(file.filename);
            }

            if (error instanceof ArtworkValidationError) {
                return res.status(400).json(ApiResponse.error(Message.ARTWORK.VALIDATION_ERROR));
            } else if (error instanceof ImageError) {
                return res.status(400).json(ApiResponse.error(Message.IMAGE.UPLOAD_ERROR));
            }
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.CREATE_ERROR));
        }
    }

    /**
    * 작품을 수정합니다.
    */
    async updateArtwork(req, res) {
        try {
            const { id } = req.params;
            const artworkData = req.body;
            const file = req.file;
            const artwork = await this.artworkService.updateArtwork(id, artworkData, file);
            return res.json(ApiResponse.success(artwork, Message.ARTWORK.UPDATE_SUCCESS));
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
            } else if (error instanceof ArtworkValidationError) {
                return res.status(400).json(ApiResponse.error(Message.ARTWORK.VALIDATION_ERROR));
            } else if (error instanceof ImageError) {
                return res.status(400).json(ApiResponse.error(Message.IMAGE.UPLOAD_ERROR));
            }
            console.error('Error updating artwork:', error);
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.UPDATE_ERROR));
        }
    }


    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(req, res) {
        try {
            const { id } = req.params;
            await this.artworkService.deleteArtwork(id);
            return res.json(ApiResponse.success(null, Message.ARTWORK.DELETE_SUCCESS));
        } catch (error) {
            if (error instanceof ArtworkNotFoundError) {
                return res.status(404).json(ApiResponse.error(Message.ARTWORK.NOT_FOUND));
            } else if (error instanceof ImageError) {
                return res.status(400).json(ApiResponse.error(Message.IMAGE.DELETE_ERROR));
            }
            console.error('Error deleting artwork:', error);
            return res.status(500).json(ApiResponse.error(Message.ARTWORK.DELETE_ERROR));
        }
    }

}


