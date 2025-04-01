import ArtworkRepository from '../../repositories/ArtworkRepository.js';
import ImageUtil from '../../utils/ImageUtil.js';
import Image from '../../models/common/image/Image.js';
import ArtworkRequestDTO from '../../models/artwork/dto/ArtworkRequestDTO.js';
import ArtworkResponseDTO from '../../models/artwork/dto/ArtworkResponseDTO.js';
import ArtworkListDTO from '../../models/artwork/dto/ArtworkListDTO.js';
import ArtworkDetailDTO from '../../models/artwork/dto/ArtworkDetailDto.js';
import ArtworkSimpleDTO from '../../models/artwork/dto/ArtworkSimpleDTO.js';
import Page from '../../models/common/page/Page.js';
import {
    ArtworkNotFoundError,
    ArtworkValidationError,
    ArtworkUploadError
} from '../../models/common/error/ArtworkError.js';
import { WebPath } from '../../constants/Path.js';

/**
 * 작품 서비스
 * 작품 관련 비즈니스 로직을 처리합니다.
 */
export default class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
        this.uploadDir = WebPath.UPLOAD.ARTWORKS;
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
     * @param {File} file - 업로드된 이미지
     * @returns {Promise<Object>} 생성된 작품 정보
     */
    async createArtwork(artworkData, file) {
        const requestDTO = new ArtworkRequestDTO(artworkData);
        const validatedData = requestDTO.toJSON();

        let imageId = null;
        let storedName;

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
                // 1. 이미지 유효성 검사
                if (!ImageUtil.validateImage(file)) {
                    throw new ArtworkUploadError('유효하지 않은 이미지 파일입니다.');
                }

                // 2. 이미지 파일 저장
                const result = await ImageUtil.saveImage(
                    file.buffer,
                    file.originalname,
                    this.uploadDir
                );
                storedName = result.storedName;

                // 3. 이미지 메타데이터 추출
                const metadata = await ImageUtil.getImageMetadata(file.buffer);

                // 4. 이미지 모델 생성 및 저장
                const image = new Image({
                    originalName: file.originalname,
                    storedName,
                    filePath: result.filePath,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    width: metadata.width,
                    height: metadata.height
                });

                // 5. 이미지 DB 저장 및 ID 가져오기
                imageId = await this.artworkRepository.saveImage(image.toJSON());
            }

            // 6. 작품 데이터 준비
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

            // 7. 작품 DB 저장
            const artwork = await this.artworkRepository.createArtwork(finalArtworkData);

            return artwork;
        } catch (error) {
            // 에러 발생 시 이미지 파일 삭제
            if (storedName) {
                try {
                    await ImageUtil.deleteImage(`${this.uploadDir}/${storedName}`);
                } catch (deleteError) {
                    console.error('이미지 파일 삭제 실패:', deleteError);
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

        let storedName = artwork.image;
        if (file) {
            const result = await ImageUtil.saveImage(file.buffer, file.originalname, this.uploadDir);
            storedName = result.storedName;
        }

        const requestDTO = new ArtworkRequestDTO({
            ...artwork,
            ...artworkData,
            id
        });
        const validatedData = requestDTO.toJSON();

        let imageId = artwork.imageId;
        if (file) {
            // 기존 이미지 삭제
            if (artwork.imageId) {
                const oldImage = await this.artworkRepository.findImageById(artwork.imageId);
                if (oldImage) {
                    await ImageUtil.deleteImage(oldImage.filePath);
                    await this.artworkRepository.deleteImage(artwork.imageId);
                }
            }

            // 새 이미지 저장
            const { filePath } = await ImageUtil.saveImage(
                file.buffer,
                file.originalname,
                this.uploadDir
            );

            // 이미지 메타데이터 추출
            const metadata = await ImageUtil.getImageMetadata(file.buffer);

            // 이미지 모델 생성
            const image = new Image({
                originalName: file.originalname,
                storedName,
                filePath,
                fileSize: file.size,
                mimeType: file.mimetype,
                width: metadata.width,
                height: metadata.height
            });

            // 이미지 저장 및 ID 가져오기
            imageId = await this.artworkRepository.saveImage(image.toJSON());
        }

        const updatedArtwork = await this.artworkRepository.updateArtwork(id, {
            ...validatedData,
            imageId,
            image: imageId ? `${WebPath.UPLOAD.ARTWORKS}/${storedName}` : null
        });

        return new ArtworkResponseDTO(updatedArtwork);
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

        // 이미지 파일 삭제
        if (artwork.imageId) {
            const image = await this.artworkRepository.findImageById(artwork.imageId);
            if (image) {
                await ImageUtil.deleteImage(image.filePath);
                await this.artworkRepository.deleteImage(artwork.imageId);
            }
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
                const image = await this.artworkRepository.findImageById(artwork.imageId);
                if (image) {
                    return {
                        ...artwork,
                        image: WebPath.UPLOAD.ARTWORKS + '/' + image.storedName
                    };
                }
            }
            return artwork;
        }));

        // DTO 변환
        return artworksWithImages.map(artwork => new ArtworkSimpleDTO(artwork));
    }
}

