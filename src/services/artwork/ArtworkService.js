import ArtworkRepository from '../../repositories/ArtworkRepository.js';
import ImageService from '../image/ImageService.js';
import { ArtworkNotFoundError, ArtworkValidationError } from '../../models/common/error/ArtworkError.js';
import ArtworkRequestDTO from '../../models/artwork/dto/ArtworkRequestDTO.js';
import ArtworkListDTO from '../../models/artwork/dto/ArtworkListDTO.js';
import ArtworkDetailDTO from '../../models/artwork/dto/ArtworkDetailDTO.js';
import ArtworkSimpleDTO from '../../models/artwork/dto/ArtworkSimpleDTO.js';
import Page from '../../models/common/page/Page.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
        this.imageService = new ImageService();
    }

    /**
     * 페이지네이션 옵션을 생성합니다.
     * @private
     */
    _createPageOptions(options = {}) {
        const {
            page = 1,
            limit = 12,
            sortField = 'createdAt',
            sortOrder = 'desc',
            baseUrl = '/artwork',
            searchType,
            keyword,
            exhibitionId,
            isFeatured
        } = options;

        return {
            page: parseInt(page),
            limit: parseInt(limit),
            sortField,
            sortOrder,
            baseUrl,
            filters: {
                searchType,
                keyword,
                exhibitionId,
                isFeatured
            }
        };
    }

    /**
     * 이미지 URL을 가져옵니다.
     * @private
     * @param {string} imageId - 이미지 ID
     * @returns {Promise<string|null>} 이미지 URL
     */
    async _getImageUrl(imageId) {
        if (!imageId) return null;
        try {
            const image = await this.imageService.getImage(imageId);
            return this.imageService.fileServerService.getUrl(image.filePath);
        } catch (error) {
            console.error('이미지 조회 실패:', error);
            return null;
        }
    }

    /**
     * 작품 목록을 조회합니다.
     */
    async getArtworkList(options = {}) {
        // 1. 페이지네이션 옵션 생성
        const pageOptions = this._createPageOptions(options);

        // 2. 작품 목록 조회
        const artworks = await this.artworkRepository.findArtworks({
            page: pageOptions.page,
            limit: pageOptions.limit,
            sortField: pageOptions.sortField,
            sortOrder: pageOptions.sortOrder,
            searchType: pageOptions.filters.searchType,
            keyword: pageOptions.filters.keyword,
            exhibitionId: pageOptions.filters.exhibitionId,
            isFeatured: pageOptions.filters.isFeatured
        });

        // 3. 이미지 정보 조회
        const artworksWithImages = await Promise.all(artworks.items.map(async artwork => {
            if (artwork.imageId) {
                artwork.image = await this._getImageUrl(artwork.imageId);
            }
            return artwork;
        }));

        // 4. Page 인스턴스 생성
        const page = new Page(artworks.total, pageOptions);

        // 5. DTO 생성 및 반환
        return new ArtworkListDTO({
            items: artworksWithImages,
            total: artworks.total,
            page: page
        });
    }

    /**
     * 작품 상세 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<Object>} 작품 상세 정보
     */
    async getArtworkDetail(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        // 이미지 정보 조회
        if (artwork.imageId) {
            artwork.image = await this._getImageUrl(artwork.imageId);
        }

        // 연관 작품 조회
        let relatedArtworks = [];
        try {
            const relatedData = await this.artworkRepository.findRelatedArtworks(id);
            relatedArtworks = relatedData.items || [];
        } catch (error) {
            console.error('연관 작품 조회 중 오류 발생:', error);
            relatedArtworks = [];
        }

        // 연관 작품의 이미지 정보 조회
        const relatedArtworksWithImages = await Promise.all(relatedArtworks.map(async item => {
            if (item.imageId) {
                item.image = await this._getImageUrl(item.imageId);
            }
            return item;
        }));

        return new ArtworkDetailDTO({
            ...artwork,
            relatedArtworks: relatedArtworksWithImages.map(item => new ArtworkSimpleDTO(item))
        });
    }

    /**
     * 작품의 간단한 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @param {string} type - 조회 타입 (card/modal)
     * @returns {Promise<Object>} 작품 간단 정보
     */
    async getArtworkSimple(id, type) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        // 이미지 정보 조회
        if (artwork.imageId) {
            artwork.image = await this._getImageUrl(artwork.imageId);
        }

        return new ArtworkSimpleDTO(artwork, type).toJSON();
    }

    /**
     * 관리자용 작품 목록을 조회합니다.
     */
    async getManagementArtworkList(options = {}) {
        return await this.getArtworkList({
            ...options,
            limit: options.limit || 10,
            baseUrl: '/admin/management/artwork'
        });
    }

    /**
     * 관리자용 작품 상세 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<Object>} 작품 상세 정보
     */
    async getManagementArtworkDetail(id) {
        return await this.getArtworkDetail(id);
    }

    /**
     * 새로운 작품을 생성합니다.
     * @param {Object} artworkData - 작품 데이터
     * @param {File} file - 업로드된 이미지
     * @returns {Promise<Object>} 생성된 작품 정보
     */
    async createArtwork(artworkData, file) {
        const requestDto = new ArtworkRequestDTO(artworkData);
        const validatedData = requestDto.toJSON();

        let imageId = null;

        // 필수 필드 검증
        if (!validatedData.title) {
            throw new ArtworkValidationError('작품 제목은 필수입니다.');
        }
        if (!validatedData.artistId) {
            throw new ArtworkValidationError('작가 ID는 필수입니다.');
        }
        if (!validatedData.artistName) {
            throw new ArtworkValidationError('작가 이름은 필수입니다.');
        }
        if (!validatedData.department) {
            throw new ArtworkValidationError('학과는 필수입니다.');
        }

        try {
            if (file) {
                // 이미지 업로드
                const image = await this.imageService.uploadImage(
                    file.buffer,
                    file.originalname,
                    'artworks'
                );
                imageId = image.id;
            }

            // 작품 데이터 준비
            const finalArtworkData = {
                ...validatedData,
                imageId,
                year: validatedData.year || new Date().getFullYear().toString(),
                medium: validatedData.medium || '',
                size: validatedData.size || '',
                isFeatured: validatedData.isFeatured || false,
                exhibitionTitle: validatedData.exhibitionTitle || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // 작품 DB 저장
            const artwork = await this.artworkRepository.createArtwork(finalArtworkData);

            return artwork;
        } catch (error) {
            // 에러 발생 시 이미지 삭제
            if (imageId) {
                try {
                    await this.imageService.deleteImage(imageId);
                } catch (deleteError) {
                    console.error('이미지 삭제 실패:', deleteError);
                }
            }
            throw error;
        }
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} artworkData - 수정할 작품 데이터
     * @param {File} file - 업로드된 이미지
     * @returns {Promise<Object>} 수정된 작품 정보
     */
    async updateArtwork(id, artworkData, file) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        const requestDto = new ArtworkRequestDTO({
            ...artwork,
            ...artworkData,
            id
        });
        const validatedData = requestDto.toJSON();

        let imageId = artwork.imageId;
        if (file) {
            // 기존 이미지 삭제
            if (artwork.imageId) {
                await this.imageService.deleteImage(artwork.imageId);
            }

            // 새 이미지 업로드
            const image = await this.imageService.uploadImage(
                file.buffer,
                file.originalname,
                'artworks'
            );
            imageId = image.id;
        }

        const updatedArtwork = await this.artworkRepository.updateArtwork(id, {
            ...validatedData,
            imageId
        });

        return new ArtworkDetailDTO(updatedArtwork);
    }

    /**
     * 작품을 삭제합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteArtwork(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        // 이미지 삭제
        if (artwork.imageId) {
            await this.imageService.deleteImage(artwork.imageId);
        }

        const success = await this.artworkRepository.deleteArtwork(id);
        if (!success) {
            throw new Error('작품 삭제에 실패했습니다.');
        }

        return true;
    }

    /**
     * 작가 목록을 조회합니다.
     * @returns {Promise<Array>} 작가 목록
     */
    async getArtists() {
        try {
            const artists = await this.artworkRepository.findArtists();
            return Array.isArray(artists) ? artists : [];
        } catch (error) {
            console.error('작가 목록 조회 중 오류 발생:', error);
            return [];
        }
    }

    /**
     * 추천 작품 목록을 조회합니다.
     * @param {number} limit - 반환할 작품 수
     * @returns {Promise<Object>} 추천 작품 목록
     */
    async getFeaturedArtworks(limit = 6) {
        // 추천 작품 조회
        const artworks = await this.artworkRepository.findFeaturedArtworks(limit);

        // 이미지 정보 조회 및 포함
        const artworksWithImages = await Promise.all(artworks.map(async artwork => {
            if (artwork.imageId) {
                artwork.image = await this._getImageUrl(artwork.imageId);
            }
            return artwork;
        }));

        // DTO 변환
        return artworksWithImages.map(artwork => new ArtworkSimpleDTO(artwork));
    }
}

