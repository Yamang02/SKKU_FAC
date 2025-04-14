import ArtworkRepository from '../../../infrastructure/db/repository/ArtworkRepository.js';
import ArtworkExhibitionRelationshipRepository from '../../../infrastructure/db/repository/relationship/ArtworkExhibitionRelationshipRepository.js';
import ImageService from '../../image/service/ImageService.js';
import UserService from '../../user/service/UserService.js';
import { ArtworkNotFoundError, ArtworkValidationError } from '../../../common/error/ArtworkError.js';
import ArtworkDetailDto from '../model/dto/ArtworkDetailDto.js';
import ArtworkSimpleDto from '../model/dto/ArtworkSimpleDto.js';
import { v4 as uuidv4 } from 'uuid';
import { generateDomainUUID, DOMAINS } from '../../../common/utils/uuid.js';
import Page from '../../common/model/Page.js';
import { db } from '../../../infrastructure/db/adapter/MySQLDatabase.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export default class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
        this.artworkExhibitionRelationshipRepository = new ArtworkExhibitionRelationshipRepository();
        this.imageService = new ImageService();
        this.userService = new UserService();

    }

    /**
     * 작품 목록을 조회합니다.
     */
    async getArtworkList(options = {}) {
        const artworks = await this.artworkRepository.findArtworks(options);
        return artworks.items.map(artwork => new ArtworkSimpleDto(artwork));
    }

    /**
     * 작품 목록과 관련 정보를 함께 조회합니다.
     * @param {Object} options - 조회 옵션 (페이지, 한 페이지당 항목 수, 정렬 등)
     * @returns {Promise<Object>} 작품 목록 및 페이지네이션 정보
     */
    async getArtworkListWithDetails(options = {}) {
        // 1. 기본 작품 목록 조회
        const artworksResult = await this.artworkRepository.findArtworks(options);
        const artworks = artworksResult.items || [];

        // 2. 각 작품에 대한 추가 정보 수집 및 DTO 생성
        const artworkItems = [];

        for (const artwork of artworks) {
            try {
                // 기본 작품 정보 준비
                const artworkDetail = {
                    id: artwork.id,
                    title: artwork.title,
                    slug: artwork.slug,
                    year: artwork.year,
                    description: artwork.description,
                    imageUrl: artwork.imageUrl,
                    userId: artwork.userId,
                    createdAt: artwork.createdAt,
                    updatedAt: artwork.updatedAt
                };

                // 작가 정보 조회 및 추가
                if (artwork.userId) {
                    try {
                        const user = await this.userService.getUserSimple(artwork.userId);
                        if (user) {
                            artworkDetail.artistName = user.name;
                            artworkDetail.artistAffiliation = user.affiliation;
                        } else {
                            artworkDetail.artistName = '작가 미상';
                            artworkDetail.artistAffiliation = '';
                        }
                    } catch (error) {
                        console.error(`작가 정보 조회 중 오류(ID: ${artwork.userId}):`, error);
                        artworkDetail.artistName = '작가 정보 없음';
                        artworkDetail.artistAffiliation = '';
                    }
                } else {
                    artworkDetail.artistName = '작가 미상';
                    artworkDetail.artistAffiliation = '';
                }

                // 전시회 정보 추가 (향후 구현)
                artworkDetail.exhibitions = [];

                // DTO 변환 및 추가
                const artworkDetailDto = new ArtworkDetailDto(artworkDetail);
                artworkItems.push(artworkDetailDto);
            } catch (error) {
                console.error(`작품 정보 처리 중 오류(ID: ${artwork.id}):`, error);
            }
        }

        // 3. 페이지네이션 정보 생성
        const totalItems = artworksResult.total || 0;
        const pageOptions = {
            page: options.page || 1,
            limit: options.limit || 10
        };

        // Page 객체 생성
        const pageInfo = new Page(totalItems, pageOptions);

        // 4. 결과 반환
        return {
            items: artworkItems,
            total: totalItems,
            pageInfo
        };
    }

    async getArtworkDetailbySlug(slug) {
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
        const artworkDetail = new ArtworkDetailDto(artwork);
        return artworkDetail;
    }

    /**
     * 관련 작품 목록을 조회합니다.
     */
    async findRelatedArtworks(artwork) {
        const relatedArtworks = [];

        // 1. 동일 작가의 다른 작품 조회
        try {
            const sameArtistArtworks = await this.artworkRepository.findByArtistId(artwork.userId, 8, artwork.id);
            for (const relatedArtwork of sameArtistArtworks) {
                const relatedArtworkSimple = new ArtworkSimpleDto(relatedArtwork);
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
        const transaction = await db.transaction();

        if (!artworkData.title) {
            throw new ArtworkValidationError('작품 제목은 필수입니다.');
        }

        artworkData.id = generateDomainUUID(DOMAINS.ARTWORK);
        artworkData.slug = artworkData.title.replace(/ /g, '_') + '_' + uuidv4().slice(0, 8);
        const uploadedImage = await this.imageService.getUploadedImageInfo(file);
        artworkData.imagePublicId = uploadedImage.publicId;
        artworkData.imageUrl = uploadedImage.imageUrl;

        try {
            const artwork = await this.artworkRepository.createArtwork(artworkData);
            if (artworkData.exhibitionId !== '') {
                console.log('작품 등록 완료:', artwork.id, artworkData.exhibitionId);
                await this.artworkExhibitionRelationshipRepository.createArtworkExhibitionRelationship(artwork.id, artworkData.exhibitionId);
            }
            console.log('작품 등록 완료:', artwork);
            await transaction.commit();
            return new ArtworkSimpleDto(artwork);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} requestDto - 수정할 작품 데이터
     * @returns {Promise<ArtworkSimpleDTO>} 수정된 작품 정보
     */
    async updateArtwork(id, artworkData) {
        const existingArtwork = await this.artworkRepository.findArtworkById(id);
        if (!existingArtwork) {
            throw new ArtworkNotFoundError();
        }

        const updatedArtwork = await this.artworkRepository.updateArtwork(id, artworkData);
        return new ArtworkDetailDto(updatedArtwork);
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

        await this.artworkExhibitionRelationshipRepository.deleteArtworkExhibitionRelationshipByArtworkId(id);
        return this.artworkRepository.updateArtworkDeleted(id);
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
            const artworkSimple = new ArtworkSimpleDto(artwork);
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
        return new ArtworkSimpleDto(artworkWithRelations);
    }

}
