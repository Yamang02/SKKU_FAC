import ArtworkRepository from '../../repositories/ArtworkRepository.js';
import FileUploadUtil from '../../utils/FileUploadUtil.js';
import ArtworkRequestDTO from '../../models/artwork/dto/ArtworkRequestDTO.js';
import ArtworkResponseDTO from '../../models/artwork/dto/ArtworkResponseDTO.js';
import ArtworkListDTO from '../../models/artwork/dto/ArtworkListDTO.js';
import ArtworkDetailDTO from '../../models/artwork/dto/ArtworkDetailDTO.js';
import ArtworkSimpleDTO from '../../models/artwork/dto/ArtworkSimpleDTO.js';
import Artwork from '../../models/artwork/Artwork.js';
import Page from '../../models/common/page/Page.js';
import {
    ArtworkNotFoundError,
    ArtworkValidationError,
    ArtworkUploadError
} from '../../models/common/error/ArtworkError.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export default class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
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

        // 3. Page 인스턴스 생성
        const page = new Page(artworks.total, pageOptions);

        // 4. DTO 생성 및 반환
        return new ArtworkListDTO({
            items: artworks.items,
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

        // 연관 작품 조회
        let relatedArtworks = [];
        try {
            const relatedData = await this.artworkRepository.findRelatedArtworks(id, artwork.artistId);
            relatedArtworks = Array.isArray(relatedData) ? relatedData : [];
        } catch (error) {
            console.error('연관 작품 조회 중 오류 발생:', error);
            relatedArtworks = [];
        }

        return new ArtworkDetailDTO({
            ...artwork,
            relatedArtworks: relatedArtworks.map(item => new ArtworkSimpleDTO(item))
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
     * @param {File} uploadedImage - 업로드된 이미지
     * @returns {Promise<Object>} 생성된 작품 정보
     */
    async createArtwork(artworkData, uploadedImage = null) {
        let imageInfo = {};
        try {
            // 1. RequestDTO 생성 및 유효성 검사
            const requestDTO = new ArtworkRequestDTO(artworkData);
            try {
                requestDTO.validate();
            } catch (error) {
                throw new ArtworkValidationError(error.message);
            }

            // 2. 이미지 처리
            if (uploadedImage) {
                try {
                    imageInfo = await FileUploadUtil.saveImage({
                        file: uploadedImage,
                        artwork_id: requestDTO.id,
                        title: requestDTO.title,
                        artist_name: requestDTO.artistName,
                        department: requestDTO.department
                    });
                } catch (error) {
                    throw new ArtworkUploadError('이미지 업로드 중 오류가 발생했습니다.');
                }
            }

            // 3. Artwork 모델 인스턴스 생성
            const artwork = new Artwork({
                ...requestDTO,
                image: imageInfo.imageUrl,
                imagePath: imageInfo.filePath,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // 4. 작품 저장
            const savedArtwork = await this.artworkRepository.createArtwork(artwork.toJSON());

            // 5. ResponseDTO 생성 및 반환
            return new ArtworkResponseDTO(savedArtwork);
        } catch (error) {
            // 이미지가 저장된 경우 삭제
            if (imageInfo && imageInfo.filePath) {
                await FileUploadUtil.deleteImage(imageInfo.filePath);
            }
            throw error;
        }
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} artworkData - 수정할 작품 데이터
     * @param {File} uploadedImage - 업로드된 이미지
     * @returns {Promise<Object>} 수정된 작품 정보
     */
    async updateArtwork(id, artworkData, uploadedImage = null) {
        let imageInfo = {};
        try {
            // 1. 기존 작품 조회
            const existingArtwork = await this.artworkRepository.findArtworkById(id);
            if (!existingArtwork) {
                throw new ArtworkNotFoundError();
            }

            // 2. RequestDTO 생성 및 유효성 검사
            const requestDTO = new ArtworkRequestDTO({
                ...existingArtwork,
                ...artworkData
            });
            try {
                requestDTO.validate();
            } catch (error) {
                throw new ArtworkValidationError(error.message);
            }

            // 3. 이미지 처리
            if (uploadedImage) {
                try {
                    // 기존 이미지 삭제
                    if (existingArtwork.imagePath) {
                        await FileUploadUtil.deleteImage(existingArtwork.imagePath);
                    }

                    // 새 이미지 저장
                    imageInfo = await FileUploadUtil.saveImage({
                        file: uploadedImage,
                        artwork_id: id,
                        title: requestDTO.title,
                        artist_name: requestDTO.artistName,
                        department: requestDTO.department
                    });
                } catch (error) {
                    throw new ArtworkUploadError('이미지 업로드 중 오류가 발생했습니다.');
                }
            }

            // 4. Artwork 모델 인스턴스 업데이트
            const artwork = new Artwork({
                ...requestDTO,
                id,
                image: imageInfo.imageUrl || existingArtwork.image,
                imagePath: imageInfo.filePath || existingArtwork.imagePath,
                updatedAt: new Date().toISOString()
            });

            // 5. 작품 저장
            const updatedArtwork = await this.artworkRepository.updateArtwork(id, artwork.toJSON());

            // 6. ResponseDTO 생성 및 반환
            return new ArtworkResponseDTO(updatedArtwork);
        } catch (error) {
            // 새 이미지가 저장된 경우 삭제
            if (imageInfo && imageInfo.filePath) {
                await FileUploadUtil.deleteImage(imageInfo.filePath);
            }
            throw error;
        }
    }

    /**
     * 작품을 삭제합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteArtwork(id) {
        // 1. 작품 조회
        const artwork = await this.artworkRepository.findArtworkById(id);
        if (!artwork) {
            throw new ArtworkNotFoundError();
        }

        // 2. 이미지 삭제
        if (artwork.imagePath) {
            try {
                await FileUploadUtil.deleteImage(artwork.imagePath);
            } catch (error) {
                throw new ArtworkUploadError('이미지 삭제 중 오류가 발생했습니다.');
            }
        }

        // 3. 작품 삭제
        return await this.artworkRepository.deleteArtwork(id);
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
        try {
            const artworks = await this.artworkRepository.findFeaturedArtworks(limit);
            return artworks.map(artwork => new ArtworkSimpleDTO(artwork, 'card'));
        } catch (error) {
            console.error('추천 작품 조회 중 오류 발생:', error);
            throw new Error('작품 데이터를 불러올 수 없습니다.');
        }
    }
}
