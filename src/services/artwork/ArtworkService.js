import ArtworkRepository from '../../repositories/ArtworkRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import ExhibitionRepository from '../../repositories/ExhibitionRepository.js';
import ImageService from '../image/ImageService.js';
import { ArtworkNotFoundError, ArtworkValidationError } from '../../models/common/error/ArtworkError.js';
import ArtworkDetailDTO from '../../models/artwork/dto/ArtworkDetailDTO.js';
import ArtworkSimpleDTO from '../../models/artwork/dto/ArtworkSimpleDTO.js';
import ArtworkRelations from '../../models/artwork/dto/relations/ArtworkRelations.js';
import { ArtworkValidator } from '../../models/artwork/validator/ArtworkValidator.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export default class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
        this.userRepository = new UserRepository();
        this.exhibitionRepository = new ExhibitionRepository();
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
            return image ? `/uploads/artworks/${image.storedName}` : null;
        } catch (error) {
            console.error('이미지 조회 실패:', error);
            return null;
        }
    }

    /**
     * 작품 목록을 조회합니다.
     */
    async getArtworkList(options = {}) {
        try {
            // 1. Repository에서 작품 목록 조회
            const artworks = await this.artworkRepository.findArtworks(options);
            if (!artworks || !artworks.items) {
                throw new Error('작품 목록을 조회할 수 없습니다.');
            }

            // 2. 각 작품에 대한 상세 정보 조회
            const artworksWithDetails = await Promise.all(
                artworks.items.map(artwork => this._enrichArtworkWithDetails(artwork))
            );

            // 3. 결과 반환
            return {
                items: artworksWithDetails,
                total: artworks.total,
                page: artworks.page
            };
        } catch (error) {
            console.error('작품 목록 조회 중 오류:', error);
            throw error;
        }
    }

    /**
     * 작품에 대한 상세 정보를 조회하여 추가합니다.
     * @private
     */
    async _enrichArtworkWithDetails(artwork) {
        try {
            // 1. 이미지 정보 조회
            let image = null;
            if (artwork.imageId) {
                try {
                    image = await this.imageService.getImage(artwork.imageId);
                } catch (error) {
                    console.error(`Error fetching image for artwork ${artwork.id}:`, error);
                }
            }

            // 2. 작가 정보 조회
            let artist = null;
            if (artwork.artistId) {
                artist = await this.userRepository.findUserById(artwork.artistId);
            }

            // 3. 전시회 정보 조회
            let exhibition = null;
            if (artwork.exhibitionId) {
                exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
            }

            // 4. ArtworkRelations 객체 생성
            const relations = new ArtworkRelations();
            relations.image = image;
            relations.artist = artist;
            relations.exhibition = exhibition;

            // 5. DTO 생성 및 반환
            return new ArtworkSimpleDTO(artwork, relations);
        } catch (error) {
            console.error(`Error processing artwork ${artwork.id}:`, error);
            return new ArtworkSimpleDTO(artwork);
        }
    }

    /**
     * 관련 작품 ID를 조회합니다.
     * @private
     * @param {number} artworkId - 기준 작품 ID
     * @param {number} artistId - 작가 ID
     * @param {number} exhibitionId - 전시회 ID
     * @returns {Promise<Array<number>>} 관련 작품 ID 목록
     */
    async _getRelatedArtworkIds(artworkId, artistId, exhibitionId) {
        try {
            const relatedIds = new Set();
            const MAX_RELATED_ITEMS = 6;

            // 1. 같은 작가의 다른 작품 ID 조회
            if (artistId && relatedIds.size < MAX_RELATED_ITEMS) {
                const remainingCount = MAX_RELATED_ITEMS - relatedIds.size;
                const artistArtworks = await this.artworkRepository.findByArtistId(artistId, remainingCount, artworkId);
                artistArtworks.forEach(artwork => {
                    if (relatedIds.size < MAX_RELATED_ITEMS) {
                        relatedIds.add(artwork.id);
                    }
                });
            }

            // 2. 같은 전시회의 다른 작품 ID 조회
            if (exhibitionId && relatedIds.size < MAX_RELATED_ITEMS) {
                const remainingCount = MAX_RELATED_ITEMS - relatedIds.size;
                const exhibitionArtworks = await this.artworkRepository.findByExhibitionId(exhibitionId, remainingCount, artworkId);
                exhibitionArtworks.forEach(artwork => {
                    if (relatedIds.size < MAX_RELATED_ITEMS) {
                        relatedIds.add(artwork.id);
                    }
                });
            }

            return Array.from(relatedIds);
        } catch (error) {
            console.error('관련 작품 ID 조회 중 오류 발생:', error);
            return [];
        }
    }

    /**
     * 작품 상세 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @param {string} type - 조회 타입 (card/modal)
     * @returns {Promise<Object>} 작품 상세 정보
     */
    async getArtworkDetail(id) {
        // 1. 작품 정보 조회
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }

        // 2. 작가 정보 조회
        let artist = null;
        if (artwork.artistId) {
            try {
                artist = await this.userRepository.findUserById(artwork.artistId);
            } catch (error) {
                console.warn(`작가 정보를 찾을 수 없습니다. (ID: ${artwork.artistId})`);
            }
        }

        // 3. 전시회 정보 조회
        let exhibition = null;
        if (artwork.exhibitionId) {
            try {
                exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
            } catch (error) {
                console.warn(`전시회 정보를 찾을 수 없습니다. (ID: ${artwork.exhibitionId})`);
            }
        }

        // 4. 이미지 정보 조회
        let image = null;
        if (artwork.imageId) {
            try {
                image = await this.imageService.getImage(artwork.imageId);
                artwork.image = await this._getImageUrl(artwork.imageId);
            } catch (error) {
                console.error(`Error fetching image for artwork ${artwork.id}:`, error);
            }
        }

        // 5. 관련 작품 ID 조회
        const relatedArtworkIds = await this._getRelatedArtworkIds(
            id,
            artwork.artistId,
            artwork.exhibitionId
        );

        // 6. ArtworkRelations 객체 생성
        const relations = new ArtworkRelations();
        relations.image = image;
        relations.artist = artist;
        relations.exhibition = exhibition;

        // 7. DTO 생성 및 반환
        return new ArtworkDetailDTO({
            ...artwork,
            relations,
            relatedArtworkIds
        });
    }

    /**
     * 작품의 간단한 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @param {string} type - 조회 타입 (card/modal)
     * @returns {Promise<Object>} 작품 간단 정보
     */
    async getArtworkSimple(id, type = 'default') {
        try {
            // 작품 정보 조회
            const artwork = await this.artworkRepository.findById(id);
            if (!artwork) {
                throw new ArtworkNotFoundError();
            }

            // 작가 정보 조회
            const artist = await this.userRepository.findUserById(artwork.artistId);
            if (!artist) {
                throw new ArtworkValidationError('작가 정보를 찾을 수 없습니다.');
            }

            // 이미지 정보 조회
            const image = await this.imageService.findImageById(artwork.imageId);

            // 전시회 정보 조회
            let exhibition = null;
            if (artwork.exhibitionId) {
                exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
            }

            // 관계 객체 생성
            const relations = new ArtworkRelations();
            relations.image = image;
            relations.artist = artist;
            relations.exhibition = exhibition;

            // DTO 생성 및 반환
            return new ArtworkSimpleDTO(artwork, relations, type);
        } catch (error) {
            console.error('작품 간단 정보 조회 중 오류:', error);
            throw error;
        }
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
     * @param {Object} requestDto - 작품 데이터
     * @param {File} file - 업로드된 이미지
     * @returns {Promise<Object>} 생성된 작품 정보
     */
    async createArtwork(requestDto, file = null) {
        // 유효성 검사
        await ArtworkValidator.validateCreateArtwork(requestDto);

        // 이미지 처리
        let imageId = null;
        if (file) {
            const image = await this.imageService.uploadImage(file);
            imageId = image.id;
        }

        // 작품 데이터 생성
        const artworkData = {
            ...requestDto,
            imageId
        };

        // 작품 생성
        return this.artworkRepository.createArtwork(artworkData);
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} requestDto - 수정할 작품 데이터
     * @param {File} file - 업로드된 이미지
     * @returns {Promise<Object>} 수정된 작품 정보
     */
    async updateArtwork(id, requestDto, file = null) {
        // 유효성 검사
        await ArtworkValidator.validateUpdateArtwork(requestDto);

        // 기존 작품 조회
        const existingArtwork = await this.artworkRepository.findArtworkById(id);
        if (!existingArtwork) {
            throw new ArtworkNotFoundError();
        }

        // 이미지 처리
        let imageId = existingArtwork.imageId;
        if (file) {
            // 기존 이미지 삭제
            if (imageId) {
                await this.imageService.deleteImage(imageId);
            }
            // 새 이미지 업로드
            const image = await this.imageService.uploadImage(file);
            imageId = image.id;
        }

        // 작품 데이터 업데이트
        const artworkData = {
            ...requestDto,
            imageId
        };

        // 작품 업데이트
        return this.artworkRepository.updateArtwork(id, artworkData);
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

        // 이미지 삭제
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
     * @returns {Promise<Array<ArtworkSimpleDTO>>} 추천 작품 목록
     */
    async getFeaturedArtworks() {
        const FEATURED_LIMIT = 6;  // 상수로 정의

        // 추천 작품 조회
        const artworks = await this.artworkRepository.findFeaturedArtworks(FEATURED_LIMIT);

        // 각 작품에 대한 상세 정보 조회 및 DTO 변환
        return Promise.all(
            artworks.map(async artwork => {
                // 이미지 정보 조회
                let image = null;
                if (artwork.imageId) {
                    try {
                        image = await this.imageService.getImage(artwork.imageId);
                    } catch (error) {
                        console.error(`이미지 조회 실패 (ID: ${artwork.imageId}):`, error);
                    }
                }

                // 작가 정보 조회
                let artist = null;
                if (artwork.artistId) {
                    try {
                        artist = await this.userRepository.findUserById(artwork.artistId);
                    } catch (error) {
                        console.error(`작가 정보 조회 실패 (ID: ${artwork.artistId}):`, error);
                    }
                }

                // ArtworkRelations 객체 생성
                const relations = new ArtworkRelations();
                relations.image = image;
                relations.artist = artist;

                // DTO 생성 및 반환
                return new ArtworkSimpleDTO(artwork, relations);
            })
        );
    }

    /**
     * ID로 작품을 조회합니다.
     * @param {number} id - 작품 ID
     * @returns {Promise<ArtworkSimpleDTO>} 작품 정보
     */
    async getArtworkById(id) {
        try {
            // 1. 작품 조회
            const artwork = await this.artworkRepository.findArtworkById(id);
            if (!artwork) {
                return null;
            }

            // 2. 이미지, 작가, 전시회 정보 조회
            let image = null;
            if (artwork.imageId) {
                try {
                    image = await this.imageService.getImage(artwork.imageId);
                } catch (error) {
                    console.error(`Error fetching image for artwork ${artwork.id}:`, error);
                }
            }

            let artist = null;
            if (artwork.artistId) {
                artist = await this.userRepository.findUserById(artwork.artistId);
            }

            let exhibition = null;
            if (artwork.exhibitionId) {
                exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
            }

            // 3. ArtworkRelations 객체 생성
            const relations = new ArtworkRelations();
            relations.image = image;
            relations.artist = artist;
            relations.exhibition = exhibition;

            // 4. DTO 생성 및 반환
            return new ArtworkSimpleDTO(artwork, relations);
        } catch (error) {
            console.error(`Error fetching artwork ${id}:`, error);
            return null;
        }
    }

    /**
     * 관련 작품 목록을 조회합니다.
     * @param {string|number} artworkId - 작품 ID
     * @returns {Promise<Array<Object>>} 관련 작품 목록
     */
    async getRelatedArtworks(artworkId) {
        try {
            // 1. 작품 정보 조회
            const artwork = await this.artworkRepository.findArtworkById(artworkId);
            if (!artwork) {
                throw new Error('작품을 찾을 수 없습니다.');
            }

            // 2. 관련 작품 ID 목록 조회
            const relatedIds = await this._getRelatedArtworkIds(
                artworkId,
                artwork.artistId,
                artwork.exhibitionId
            );

            if (relatedIds.length === 0) {
                return [];
            }

            // 3. 관련 작품 정보 조회
            const relatedArtworks = await Promise.all(
                relatedIds.map(async id => {
                    const artwork = await this.artworkRepository.findArtworkById(id);
                    if (!artwork) return null;

                    // 이미지 정보 조회
                    let image = null;
                    if (artwork.imageId) {
                        try {
                            image = await this.imageService.getImage(artwork.imageId);
                            artwork.image = await this._getImageUrl(artwork.imageId);
                        } catch (error) {
                            console.error(`Error fetching image for artwork ${artwork.id}:`, error);
                        }
                    }

                    // 작가 정보 조회
                    let artist = null;
                    if (artwork.artistId) {
                        try {
                            artist = await this.userRepository.findUserById(artwork.artistId);
                        } catch (error) {
                            console.warn(`작가 정보를 찾을 수 없습니다. (ID: ${artwork.artistId})`);
                        }
                    }

                    // 전시회 정보 조회
                    let exhibition = null;
                    if (artwork.exhibitionId) {
                        try {
                            exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
                        } catch (error) {
                            console.warn(`전시회 정보를 찾을 수 없습니다. (ID: ${artwork.exhibitionId})`);
                        }
                    }

                    // ArtworkRelations 객체 생성
                    const relations = new ArtworkRelations();
                    relations.image = image;
                    relations.artist = artist;
                    relations.exhibition = exhibition;

                    // DTO 생성
                    return new ArtworkSimpleDTO(artwork, relations);
                })
            );

            // null 값 제거
            return relatedArtworks.filter(artwork => artwork !== null);
        } catch (error) {
            console.error('관련 작품 조회 중 오류:', error);
            return [];
        }
    }
}

