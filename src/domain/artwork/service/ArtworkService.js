import ArtworkRepository from '../../../infrastructure/db/repository/ArtworkRepository.js';
import ImageService from '../../image/service/ImageService.js';
import { ArtworkNotFoundError, ArtworkValidationError } from '../../../common/error/ArtworkError.js';
import ArtworkDetailDTO from '../model/dto/ArtworkDetailDTO.js';
import ArtworkSimpleDTO from '../model/dto/ArtworkSimpleDTO.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export default class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
        this.imageService = new ImageService();
    }

    /**
     * 작품 목록을 조회합니다.
     */
    async getArtworkList(options = {}) {
        const artworks = await this.artworkRepository.findArtworks(options);
        return artworks.items.map(artwork => new ArtworkSimpleDTO(artwork));
    }

    /**
     * 작품 상세 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<ArtworkDetailDTO>} 작품 상세 정보
     */
    async getArtworkDetail(id) {
        const artworkWithRelations = await this.artworkRepository.findArtworkWithRelations(id);
        if (!artworkWithRelations) {
            throw new ArtworkNotFoundError();
        }
        return new ArtworkDetailDTO(artworkWithRelations);
    }

    /**
     * 새로운 작품을 생성합니다.
     */
    async createArtwork(artworkData, file) {
        if (!artworkData.title) {
            throw new ArtworkValidationError('작품 제목은 필수입니다.');
        }

        const uploadedImage = await this.imageService.uploadImage(file, 'artworks');
        const artwork = await this.artworkRepository.createArtwork({
            ...artworkData,
            imageId: uploadedImage.id
        });
        return new ArtworkSimpleDTO(artwork);
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} requestDto - 수정할 작품 데이터
     * @param {File} file - 업로드된 이미지
     * @returns {Promise<ArtworkSimpleDTO>} 수정된 작품 정보
     */
    async updateArtwork(id, requestDto, file = null) {
        const existingArtwork = await this.artworkRepository.findArtworkById(id);
        if (!existingArtwork) {
            throw new ArtworkNotFoundError();
        }

        let imageId = existingArtwork.imageId;
        if (file) {
            if (imageId) {
                await this.imageService.deleteImage(imageId);
            }
            const image = await this.imageService.uploadImage(file);
            imageId = image.id;
        }

        const artworkData = {
            ...requestDto,
            imageId
        };

        const updatedArtwork = await this.artworkRepository.updateArtwork(id, artworkData);
        return new ArtworkSimpleDTO(updatedArtwork);
    }

    /**
     * 작품을 삭제합니다.
     * @param {number} id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteArtwork(id) {
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        if (artwork.imageId) {
            await this.imageService.deleteImage(artwork.imageId);
        }

        return this.artworkRepository.deleteArtwork(id);
    }

    /**
     * 작품 이미지를 업로드합니다.
     * @param {Object} file - 업로드된 파일 객체
     * @returns {Promise<Object>} 업로드된 이미지 정보
     */
    async uploadArtworkImage(file) {
        return this.imageService.uploadImage(file);
    }

    /**
     * 작가 목록을 조회합니다.
     * @returns {Promise<Array>} 작가 목록
     */
    async getArtists() {
        const artists = await this.artworkRepository.findArtists();
        return Array.isArray(artists) ? artists : [];
    }

    /**
     * 추천 작품 목록을 조회합니다.
     * @returns {Promise<Array<ArtworkSimpleDTO>>} 추천 작품 목록
     */
    async getFeaturedArtworks() {
        const FEATURED_LIMIT = 6;  // 상수로 정의
        const artworks = await this.artworkRepository.findFeaturedArtworks(FEATURED_LIMIT);
        return artworks.map(artwork => new ArtworkSimpleDTO(artwork));
    }

    /**
     * ID로 작품을 조회합니다.
     * @param {number} id - 작품 ID
     * @returns {Promise<ArtworkSimpleDTO>} 작품 정보
     */
    async getArtworkById(id) {
        const artworkWithRelations = await this.artworkRepository.findArtworkWithRelations(id);
        if (!artworkWithRelations) {
            throw new ArtworkNotFoundError();
        }
        return new ArtworkSimpleDTO(artworkWithRelations);
    }

    /**
     * 관련 작품 목록을 조회합니다.
     * @param {string|number} artworkId - 작품 ID
     * @returns {Promise<Array<ArtworkSimpleDTO>>} 관련 작품 목록
     */
    async getRelatedArtworks(artworkId) {
        const artwork = await this.artworkRepository.findArtworkById(artworkId);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        const relatedIds = await this.artworkRepository.getRelatedArtworkIds(artworkId);
        const relatedArtworks = await Promise.all(
            relatedIds.map(async id => {
                const relatedArtwork = await this.artworkRepository.findArtworkById(id);
                return new ArtworkSimpleDTO(relatedArtwork);
            })
        );

        return relatedArtworks.filter(artwork => artwork !== null);
    }
}
