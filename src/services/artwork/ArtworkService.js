import ArtworkRepository from '../../repositories/ArtworkRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import ExhibitionRepository from '../../repositories/ExhibitionRepository.js';
import ImageService from '../image/ImageService.js';
import { ArtworkNotFoundError, ArtworkValidationError } from '../../models/common/error/ArtworkError.js';
import ArtworkRequestDTO from '../../models/artwork/dto/ArtworkRequestDTO.js';
import ArtworkListDTO from '../../models/artwork/dto/ArtworkListDTO.js';
import ArtworkDetailDTO from '../../models/artwork/dto/ArtworkDetailDTO.js';
import ArtworkSimpleDTO from '../../models/artwork/dto/ArtworkSimpleDTO.js';
import Page from '../../models/common/page/Page.js';
import ArtworkRelations from '../../models/artwork/dto/relations/ArtworkRelations.js';
import { ArtworkValidator } from '../../models/artwork/validator/ArtworkValidator.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export class ArtworkService {
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
        // 1. 페이지네이션 옵션 생성
        const pageOptions = this._createPageOptions(options);

        // 2. 작품 목록 조회
        const queryOptions = { ...pageOptions };
        if (options.isFeatured !== undefined) {
            queryOptions.isFeatured = options.isFeatured === 'true';
        }

        const artworks = await this.artworkRepository.findArtworks(queryOptions);

        // 3. 이미지, 작가, 전시회 정보 조회
        const artworksWithDetails = await Promise.all(artworks.items.map(async artwork => {
            try {
                // 이미지 정보 조회
                let image = null;
                if (artwork.imageId) {
                    try {
                        image = await this.imageService.getImage(artwork.imageId);
                    } catch (error) {
                        console.error(`Error fetching image for artwork ${artwork.id}:`, error);
                    }
                }

                // 작가 정보 조회
                let artist = null;
                if (artwork.artistId) {
                    artist = await this.userRepository.findUserById(artwork.artistId);
                }

                // 전시회 정보 조회
                let exhibition = null;
                if (artwork.exhibitionId) {
                    exhibition = await this.exhibitionRepository.findExhibitionById(artwork.exhibitionId);
                }

                // ArtworkRelations 객체 생성
                const relations = new ArtworkRelations();
                relations.image = image;
                relations.artist = artist;
                relations.exhibition = exhibition;

                // DTO 생성
                const dto = new ArtworkSimpleDTO(artwork, relations);
                console.log(`DTO created for artwork ${artwork.id}:`, {
                    image: dto.image,
                    artistName: dto.artistName,
                    exhibitionTitle: dto.exhibitionTitle
                });
                return dto;
            } catch (error) {
                console.error(`Error processing artwork ${artwork.id}:`, error);
                return new ArtworkSimpleDTO(artwork);
            }
        }));

        // 4. Page 인스턴스 생성
        const page = new Page(artworks.total, pageOptions);

        // 5. DTO 생성 및 반환
        return new ArtworkListDTO({
            items: artworksWithDetails,
            total: artworks.total,
            page: page
        });
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

            // 1. 같은 작가의 다른 작품 ID 조회 (최대 6개)
            if (artistId) {
                const artistArtworks = await this.artworkRepository.findByArtistId(artistId, MAX_RELATED_ITEMS, artworkId);
                artistArtworks.forEach(artwork => relatedIds.add(artwork.id));
            }

            // 2. 아직 6개가 안 되고 전시회 ID가 있는 경우, 같은 전시회의 다른 작품으로 채움
            if (relatedIds.size < MAX_RELATED_ITEMS && exhibitionId) {
                const remainingCount = MAX_RELATED_ITEMS - relatedIds.size;
                const exhibitionArtworks = await this.artworkRepository.findByExhibitionId(exhibitionId, remainingCount, artworkId);
                exhibitionArtworks.forEach(artwork => relatedIds.add(artwork.id));
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
     * @param {Object} artworkData - 작품 데이터
     * @param {File} file - 업로드된 이미지
     * @returns {Promise<Object>} 생성된 작품 정보
     */
    async createArtwork(artworkData, file) {
        const requestDto = new ArtworkRequestDTO(artworkData);
        const validatedData = requestDto.toJSON();

        // 1. 데이터 구조 검증
        ArtworkValidator.validateCreate(validatedData);

        // 2. 이미지 파일 존재 여부 검증
        if (!file) {
            throw new ArtworkValidationError('이미지는 필수입니다.');
        }

        try {
            // 3. 이미지 업로드 및 저장
            console.log('이미지 업로드 시작');
            const uploadedImage = await this.imageService.uploadImage(
                file.buffer,
                file.originalname,
                'artworks'
            );
            console.log('이미지 업로드 완료:', uploadedImage);

            // 4. 작품 데이터 준비
            const finalArtworkData = {
                title: validatedData.title,
                artistId: validatedData.artistId,
                artistName: validatedData.artistName,
                department: validatedData.department,
                imageId: uploadedImage.id,
                description: validatedData.description || '',
                medium: validatedData.medium || '',
                size: validatedData.size || '',
                year: validatedData.year || '',
                exhibitionId: validatedData.exhibitionId || null,
                isFeatured: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // 5. 작품 DB 저장
            console.log('작품 데이터 저장 시작:', finalArtworkData);
            const artwork = await this.artworkRepository.createArtwork(finalArtworkData);
            console.log('작품 데이터 저장 완료:', artwork);

            return artwork;
        } catch (error) {
            console.error('작품 생성 중 오류 발생:', error);
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
}

