import ArtworkManagementDto from '#domain/admin/model/dto/artwork/ArtworkManagementDto.js';
import ArtworkListManagementDto from '#domain/admin/model/dto/artwork/ArtworkListManagementDto.js';
import { ArtworkNotFoundError } from '#common/error/ArtworkError.js';
import BaseAdminService from '#domain/admin/service/BaseAdminService.js';

export default class ArtworkAdminService extends BaseAdminService {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['ArtworkService', 'ArtworkRepository', 'ExhibitionRepository', 'UserAccountRepository'];

    constructor(
        artworkService = null,
        artworkRepository = null,
        exhibitionRepository = null,
        userAccountRepository = null
    ) {
        super('ArtworkAdminService');

        // 의존성 주입 확인
        if (!artworkService || !artworkRepository || !exhibitionRepository || !userAccountRepository) {
            throw new Error('ArtworkAdminService: 모든 의존성이 주입되어야 합니다.');
        }

        this.artworkService = artworkService;
        this.artworkRepository = artworkRepository;
        this.exhibitionRepository = exhibitionRepository;
        this.userAccountRepository = userAccountRepository;
    }

    /**
     * 작품 목록을 조회합니다.
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Object>} 작품 목록 데이터
     */
    async getArtworkList(options) {
        return this.safeExecute(
            async () => {
                const normalizedOptions = this.normalizeFilterOptions(options);
                const { page, limit, keyword, status, isFeatured, sortField, sortOrder } = normalizedOptions;

                const filterOptions = {
                    page,
                    limit,
                    keyword,
                    status,
                    sortField,
                    sortOrder
                };

                // 주요 작품 필터링 처리
                if (isFeatured !== undefined) {
                    filterOptions.isFeatured = isFeatured;
                }

                const result = await this.artworkRepository.findArtworks(filterOptions, true);
                const artworks = result.items || [];
                const total = result.total || 0;

                // 작품 목록 DTO 변환
                const artworkDtos = [];
                for (const artwork of artworks) {
                    // 작가 정보 가져오기
                    const artist = artwork.userId
                        ? await this.userAccountRepository.findUserById(artwork.userId)
                        : null;

                    // 전시회 정보 가져오기
                    const exhibition = artwork.exhibitionId
                        ? await this.exhibitionRepository.findById(artwork.exhibitionId)
                        : null;

                    const artworkData = new ArtworkListManagementDto(artwork);

                    artworkData.artistName = artist?.name || '작가 미상';
                    artworkData.exhibitionTitle = exhibition?.title || '';

                    artworkDtos.push(artworkData);
                }

                // 표준화된 응답 생성
                return this.createListResponse(artworkDtos, total, options, {
                    keyword: options.keyword,
                    status: options.status,
                    isFeatured: options.isFeatured
                });
            },
            '작품 목록 조회',
            { options }
        );
    }

    /**
     * 작품 상세 정보를 조회합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<Object>} 작품 상세 데이터
     */
    async getArtworkDetail(id) {
        return this.safeExecute(
            async () => {
                const artwork = await this.artworkRepository.findArtworkById(id, true);
                if (!artwork) {
                    throw new ArtworkNotFoundError();
                }

                // 작가 정보 가져오기
                const artist = artwork.userId ? await this.userAccountRepository.findUserById(artwork.userId) : null;

                // 전시회 정보 가져오기
                const exhibition = artwork.exhibitionId
                    ? await this.exhibitionRepository.findById(artwork.exhibitionId)
                    : null;

                const artworkDto = new ArtworkManagementDto(artwork);
                artworkDto.artistName = artist?.name || '작가 미상';
                artworkDto.exhibitionTitle = exhibition?.title || '';

                return artworkDto;
            },
            '작품 상세 조회',
            { id }
        );
    }

    /**
     * 작품을 삭제합니다.
     * @param {number} artworkId - 작품 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteArtwork(artworkId) {
        return this.deleteEntity(artworkId, this.artworkService, '작품');
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string} id - 작품 ID
     * @param {Object} artworkData - 수정할 작품 데이터
     * @returns {Promise<ArtworkManagementDto>} 수정된 작품 정보
     */
    async updateArtwork(id, artworkData) {
        return this.safeExecute(
            async () => {
                const existingArtwork = await this.artworkRepository.findArtworkById(id, true);
                if (!existingArtwork) {
                    throw new ArtworkNotFoundError();
                }

                const updatedArtwork = await this.artworkRepository.updateArtwork(id, artworkData, true);
                return new ArtworkManagementDto(updatedArtwork);
            },
            '작품 수정',
            { id, artworkData }
        );
    }

    /**
     * 작품 상태를 업데이트합니다.
     * @param {string} id - 작품 ID
     * @param {string} status - 변경할 상태 (PENDING, APPROVED, BLOCKED, DELETED)
     * @returns {Promise<ArtworkManagementDto>} 수정된 작품 정보
     */
    async updateArtworkStatus(id, status) {
        return this.safeExecute(
            async () => {
                const existingArtwork = await this.artworkRepository.findArtworkById(id);
                if (!existingArtwork) {
                    throw new ArtworkNotFoundError();
                }

                const updatedArtwork = await this.artworkRepository.updateArtwork(id, { status });
                return new ArtworkManagementDto(updatedArtwork);
            },
            '작품 상태 업데이트',
            { id, status }
        );
    }

    /**
     * 작품의 주요 작품 여부를 토글합니다.
     * @param {string} id - 작품 ID
     * @returns {Promise<ArtworkManagementDto>} 수정된 작품 정보
     */
    async toggleFeatured(id) {
        return this.safeExecute(
            async () => {
                const existingArtwork = await this.artworkRepository.findArtworkById(id);
                if (!existingArtwork) {
                    throw new ArtworkNotFoundError();
                }

                const updatedArtwork = await this.artworkRepository.updateArtwork(id, {
                    isFeatured: !existingArtwork.isFeatured
                });

                return new ArtworkManagementDto(updatedArtwork);
            },
            '작품 주요 작품 설정',
            { id }
        );
    }

    /**
     * 작품 생성 및 수정 시 필요한 폼 데이터를 조회합니다.
     * @returns {Promise<Object>} 작가 및 전시회 목록
     */
    async getArtworkFormData() {
        return this.safeExecute(async () => {
            const artists = await this.userAccountRepository.findArtists();
            const exhibitions = await this.exhibitionRepository.findAll();

            return {
                artists,
                exhibitions
            };
        }, '작품 폼 데이터 조회');
    }

    /**
     * 새 작품을 생성합니다.
     * @param {Object} artworkData - 작품 데이터
     * @param {Object} file - 업로드된 이미지 파일
     * @returns {Promise<ArtworkManagementDto>} 생성된 작품 정보
     */
    async createArtwork(artworkData, file) {
        return this.safeExecute(
            async () => {
                // 체크박스의 경우 체크 해제시 undefined가 옴
                if (artworkData.isFeatured === undefined) {
                    artworkData.isFeatured = false;
                } else if (artworkData.isFeatured === 'on') {
                    artworkData.isFeatured = true;
                }

                const newArtwork = await this.artworkService.createArtwork(artworkData, file);
                return new ArtworkManagementDto(newArtwork);
            },
            '작품 생성',
            { artworkData, file }
        );
    }
}
