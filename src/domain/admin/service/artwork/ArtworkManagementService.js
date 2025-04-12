import ArtworkService from '../../../artwork/service/ArtworkService.js';
import ArtworkManagementDto from '../../model/dto/artwork/ArtworkManagementDto.js';
import ArtworkListManagementDto from '../../model/dto/artwork/ArtworkListManagementDto.js';
import ArtworkRepository from '../../../../infrastructure/db/repository/ArtworkRepository.js';
import ExhibitionRepository from '../../../../infrastructure/db/repository/ExhibitionRepository.js';
import UserAccountRepository from '../../../../infrastructure/db/repository/UserAccountRepository.js';
import Page from '../../../common/model/Page.js';
import { ArtworkNotFoundError } from '../../../../common/error/ArtworkError.js';

export default class ArtworkManagementService {
    constructor() {
        this.artworkService = new ArtworkService();
        this.artworkRepository = new ArtworkRepository();
        this.exhibitionRepository = new ExhibitionRepository();
        this.userAccountRepository = new UserAccountRepository();
    }

    /**
     * 작품 목록을 조회합니다.
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Object>} 작품 목록 데이터
     */
    async getArtworkList(options) {
        try {
            const { page, limit, artistId, keyword, status, isFeatured } = options;
            const filterOptions = { ...options };

            if (artistId) {
                filterOptions.artistId = artistId;
            }

            if (keyword) {
                filterOptions.keyword = keyword;
            }

            if (status) {
                filterOptions.status = status;
            }

            if (isFeatured === 'true') {
                filterOptions.isFeatured = true;
            } else if (isFeatured === 'false') {
                filterOptions.isFeatured = false;
            }

            const result = await this.artworkRepository.findArtworks(filterOptions);
            const artworks = result.items || [];
            const total = result.total || 0;

            // 작품 목록 DTO 변환
            const artworkDtos = [];
            for (const artwork of artworks) {
                // 작가 정보 가져오기
                const artist = artwork.userId ? await this.userAccountRepository.findUserById(artwork.userId) : null;
                // 전시회 정보 가져오기
                const exhibition = artwork.exhibitionId ?
                    await this.exhibitionRepository.findById(artwork.exhibitionId) : null;

                const artworkData = {
                    ...artwork,
                    artistName: artist?.name || '작가 미상',
                    exhibitionTitle: exhibition?.title || ''
                };

                const artworkDto = new ArtworkListManagementDto(artworkData);
                artworkDtos.push(artworkDto);
            }

            // 작가 목록 조회 (필터용)
            const artists = [];

            // 페이지네이션 정보 생성
            const pageInfo = new Page(total, { page, limit });

            return {
                artworks: artworkDtos,
                total,
                page: pageInfo,
                artists,
                filters: {
                    artistId: options.artistId,
                    keyword: options.keyword,
                    status: options.status,
                    isFeatured: options.isFeatured
                }
            };
        } catch (error) {
            console.error('작품 목록 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 작품 상세 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<Object>} 작품 상세 데이터
     */
    async getArtworkDetail(id) {
        try {
            const artwork = await this.artworkRepository.findArtworkById(id);
            if (!artwork) {
                throw new ArtworkNotFoundError();
            }

            // 작가 정보 가져오기
            const artist = artwork.userId ?
                await this.userAccountRepository.findUserById(artwork.userId) : null;

            // 전시회 정보 가져오기
            const exhibition = artwork.exhibitionId ?
                await this.exhibitionRepository.findById(artwork.exhibitionId) : null;

            // 전체 작가 및 전시회 목록 (선택용)
            const artists = await this.userAccountRepository.findArtists();
            const exhibitions = await this.exhibitionRepository.findAll();

            const artworkData = {
                ...artwork,
                artistName: artist?.name || '작가 미상',
                exhibitionTitle: exhibition?.title || ''
            };

            const artworkDto = new ArtworkManagementDto(artworkData);

            return {
                artwork: artworkDto,
                artists,
                exhibitions
            };
        } catch (error) {
            console.error('작품 상세 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 작품을 삭제합니다.
     * @param {number} artworkId - 작품 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteArtwork(artworkId) {
        try {
            return await this.artworkService.deleteArtwork(artworkId);
        } catch (error) {
            console.error('작품 삭제 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} artworkData - 수정할 작품 데이터
     * @returns {Promise<ArtworkManagementDto>} 수정된 작품 정보
     */
    async updateArtwork(id, artworkData) {
        try {
            const existingArtwork = await this.artworkRepository.findArtworkById(id);
            if (!existingArtwork) {
                throw new ArtworkNotFoundError();
            }

            // 체크박스의 경우 체크 해제시 undefined가 옴
            if (artworkData.isFeatured === undefined) {
                artworkData.isFeatured = false;
            }

            const updatedArtwork = await this.artworkRepository.updateArtwork(id, artworkData);
            return new ArtworkManagementDto(updatedArtwork);
        } catch (error) {
            console.error('작품 수정 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 작품 상태를 업데이트합니다.
     * @param {string} id - 작품 ID
     * @param {string} status - 변경할 상태 (PENDING, APPROVED, BLOCKED, DELETED)
     * @returns {Promise<ArtworkManagementDto>} 수정된 작품 정보
     */
    async updateArtworkStatus(id, status) {
        try {
            const existingArtwork = await this.artworkRepository.findArtworkById(id);
            if (!existingArtwork) {
                throw new ArtworkNotFoundError();
            }

            const updatedArtwork = await this.artworkRepository.updateArtwork(id, { status });
            return new ArtworkManagementDto(updatedArtwork);
        } catch (error) {
            console.error('작품 상태 업데이트 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 작품의 주요 작품 여부를 토글합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<ArtworkManagementDto>} 수정된 작품 정보
     */
    async toggleFeatured(id) {
        try {
            const existingArtwork = await this.artworkRepository.findArtworkById(id);
            if (!existingArtwork) {
                throw new ArtworkNotFoundError();
            }

            const updatedArtwork = await this.artworkRepository.updateArtwork(id, {
                isFeatured: !existingArtwork.isFeatured
            });

            return new ArtworkManagementDto(updatedArtwork);
        } catch (error) {
            console.error('작품 주요 작품 설정 오류:', error);
            throw error;
        }
    }

    /**
     * 작품 생성 및 수정 시 필요한 폼 데이터를 조회합니다.
     * @returns {Promise<Object>} 작가 및 전시회 목록
     */
    async getArtworkFormData() {
        try {
            const artists = await this.userAccountRepository.findArtists();
            const exhibitions = await this.exhibitionRepository.findAll();

            return {
                artists,
                exhibitions
            };
        } catch (error) {
            console.error('작품 폼 데이터 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 새 작품을 생성합니다.
     * @param {Object} artworkData - 작품 데이터
     * @param {Object} file - 업로드된 이미지 파일
     * @returns {Promise<ArtworkManagementDto>} 생성된 작품 정보
     */
    async createArtwork(artworkData, file) {
        try {
            // 체크박스의 경우 체크 해제시 undefined가 옴
            if (artworkData.isFeatured === undefined) {
                artworkData.isFeatured = false;
            } else if (artworkData.isFeatured === 'on') {
                artworkData.isFeatured = true;
            }

            const newArtwork = await this.artworkService.createArtwork(artworkData, file);
            return new ArtworkManagementDto(newArtwork);
        } catch (error) {
            console.error('작품 생성 서비스 오류:', error);
            throw error;
        }
    }
}
