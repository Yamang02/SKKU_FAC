import ArtworkRepository from '../../../infrastructure/db/repository/ArtworkRepository.js';
import ImageService from '../../image/service/ImageService.js';
import UserService from '../../user/service/UserService.js';
import { ArtworkNotFoundError, ArtworkValidationError } from '../../../common/error/ArtworkError.js';
import ArtworkDetailDTO from '../model/dto/ArtworkDetailDTO.js';
import ArtworkSimpleDTO from '../model/dto/ArtworkSimpleDTO.js';
import { v4 as uuidv4 } from 'uuid';
import { generateDomainUUID, DOMAINS } from '../../../common/utils/uuid.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export default class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
        this.imageService = new ImageService();
        this.userService = new UserService();
    }

    /**
     * 작품 목록을 조회합니다.
     */
    async getArtworkList(options = {}) {
        const artworks = await this.artworkRepository.findArtworks(options);
        return artworks.items.map(artwork => new ArtworkSimpleDTO(artwork));
    }


    async getArtworkDetailbySlug(slug) {
        console.log('slug : ', slug);
        const artwork = await this.artworkRepository.findArtworkBySlug(slug);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }
        const user = await this.userService.getUserSimple(artwork.userId);
        if (!user) {
            throw new Error('작가 정보를 찾을 수 없습니다.');
        }
        artwork.artistName = user.name;
        artwork.artistAffiliation = user.affiliation;

        const relatedArtworks = await this.findRelatedArtworks(artwork);
        artwork.relatedArtworks = relatedArtworks;
        const artworkDetail = new ArtworkDetailDTO(artwork);
        console.log('artworkDetail : ', artworkDetail);
        return artworkDetail;
    }

    /**
     * 관련 작품 목록을 조회합니다.
     */
    async findRelatedArtworks(artwork) {
        console.log('findRelatedArtworks 실행');
        const relatedArtworks = [];

        // 1. 동일 작가의 다른 작품 조회
        try {
            const sameArtistArtworks = await this.artworkRepository.findByArtistId(artwork.userId, 8, artwork.id);
            for (const relatedArtwork of sameArtistArtworks) {
                const relatedArtworkSimple = new ArtworkSimpleDTO(relatedArtwork);
                relatedArtworkSimple.artistName = artwork.artistName;
                relatedArtworkSimple.artistAffiliation = artwork.artistAffiliation;
                relatedArtworks.push(relatedArtworkSimple);
            }
        } catch (error) {
            console.error(error);
        }

        // 4. 최종적으로 8개 이하의 관련 작품 반환
        return relatedArtworks.slice(0, 8); // 최대 8개로 제한
    }


    /**
     * 새로운 작품을 생성합니다.
     */
    async createArtwork(artworkData, file) {
        if (!artworkData.title) {
            throw new ArtworkValidationError('작품 제목은 필수입니다.');
        }

        artworkData.id = generateDomainUUID(DOMAINS.ARTWORK);
        artworkData.slug = artworkData.title.replace(/ /g, '_') + '_' + uuidv4().slice(0, 8);
        console.log(artworkData.slug);
        const uploadedImage = await this.imageService.getUploadedImageInfo(file);
        artworkData.imagePublicId = uploadedImage.publicId;
        artworkData.imageUrl = uploadedImage.imageUrl;
        const artwork = await this.artworkRepository.createArtwork(artworkData);
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
            const image = await this.imageService.getUploadedImageInfo(file);
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
     * 업로드된 이미지 정보를 조회합니다.
     * @param {Object} file - 업로드된 파일 객체
     * @returns {Promise<Object>} 업로드된 이미지 정보
     */
    async uploadArtworkImage(file) {
        return this.imageService.getUploadedImageInfo(file);
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
        const FEATURED_LIMIT = 6;
        const artworks = await this.artworkRepository.findFeaturedArtworks(FEATURED_LIMIT);
        const artworkSimpleList = [];

        for (const artwork of artworks) {
            const artworkSimple = new ArtworkSimpleDTO(artwork);
            const user = await this.userService.getUserSimple(artworkSimple.userId);

            if (user) {
                artworkSimple.artistName = user.name;
                artworkSimple.artistAffiliation = user.affiliation;
            }

            if (artwork.exhibition) {
                artworkSimple.exhibitionName = artwork.exhibition.name;
            }

            artworkSimpleList.push(artworkSimple);
        }

        return artworkSimpleList;
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

}
