/**
 * 전시회 서비스
 * 전시회 관련 비즈니스 로직을 처리합니다.
 */
import ExhibitionRepository from '../../../infrastructure/db/repository/ExhibitionRepository.js';
import ArtworkExhibitionRelationshipRepository from '../../../infrastructure/db/repository/relationship/ArtworkExhibitionRelationshipRepository.js';
import ImageService from '../../image/service/ImageService.js';
import { ExhibitionNotFoundError } from '../../../common/error/ExhibitionError.js';
import ExhibitionResponseDto from '../model/dto/ExhibitionResponseDto.js';
import ExhibitionListDto from '../model/dto/ExhibitionListDto.js';
import ExhibitionSimpleDto from '../model/dto/ExhibitionSimpleDto.js';

/**
 * 전시회 서비스
 */
export default class ExhibitionService {
    constructor() {
        this.exhibitionRepository = new ExhibitionRepository();
        this.imageService = new ImageService();
        this.artworkExhibitionRelationshipRepository = new ArtworkExhibitionRelationshipRepository();
    }

    async getExhibitionsSimple(exhibitionIds) {
        const exhibitions = await this.exhibitionRepository.findExhibitionsByIds(exhibitionIds);
        const exhibitionSimpleDtos = [];
        if (exhibitions.length > 0) {
            for (const exhibition of exhibitions) {
                const exhibitionSimpleDto = new ExhibitionSimpleDto(exhibition);
                exhibitionSimpleDtos.push(exhibitionSimpleDto);
            }
        }

        return exhibitionSimpleDtos;
    }

    async getExhibitionSimple(exhibitionId) {
        const exhibition = await this.exhibitionRepository.findExhibitionById(exhibitionId);
        return new ExhibitionSimpleDto(exhibition);
    }

    async getFeaturedExhibitions(limit = 5) {
        const exhibitions = await this.exhibitionRepository.findFeaturedExhibitions(limit);
        const exhibitionSimpleDtos = [];
        if (exhibitions.length > 0) {
            for (const exhibition of exhibitions) {
                const exhibitionSimpleDto = new ExhibitionSimpleDto(exhibition);
                exhibitionSimpleDtos.push(exhibitionSimpleDto);
            }
        }
        return exhibitionSimpleDtos;
    }

    // ===== 관리자용 메서드 =====
    /**
     * 새로운 전시회를 생성합니다.
     * @param {ExhibitionRequestDto} exhibitionDto - 전시회 생성 데이터
     * @returns {Promise<ExhibitionResponseDto>} 생성된 전시회 정보
     */
    async createExhibition(exhibitionDto) {
        return this.exhibitionRepository.create(exhibitionDto);
    }

    /**
     * 관리자용: 필터링 옵션이 포함된 전시회 목록을 조회합니다.
     * @param {Object} options - 페이지네이션 및 필터링 옵션
     * @returns {Promise<Object>} 전시회 목록 데이터
     */
    async getManagementExhibitions(options) {
        try {
            const { page = 1, limit = 10, exhibitionType, isFeatured, year, search } = options;
            const filterOptions = { page, limit };

            // 필터 적용
            if (exhibitionType) {
                filterOptions.exhibitionType = exhibitionType;
            }

            if (isFeatured === true || isFeatured === 'true') {
                filterOptions.isFeatured = true;
            } else if (isFeatured === false || isFeatured === 'false') {
                filterOptions.isFeatured = false;
            }

            if (year) {
                filterOptions.year = year;
            }

            if (search) {
                filterOptions.search = search;
            }

            // 전시회 목록 조회
            return await this.exhibitionRepository.findExhibitions(filterOptions);
        } catch (error) {
            console.error('전시회 목록 조회 중 오류:', error);
            throw error;
        }
    }

    /**
     * 관리자용: 새 전시회를 생성합니다.
     * @param {Object} exhibitionData - 전시회 데이터
     * @returns {Promise<Object>} 생성된 전시회 객체
     */
    async createManagementExhibition(exhibitionData) {
        try {
            return await this.exhibitionRepository.createExhibition({
                ...exhibitionData
            });
        } catch (error) {
            console.error('전시회 생성 중 오류:', error);
            throw error;
        }
    }

    /**
     * 관리자용: 전시회를 수정합니다.
     * @param {string} id - 전시회 ID
     * @param {Object} exhibitionData - 수정할 전시회 데이터
     * @returns {Promise<Object>} 수정된 전시회 객체
     */
    async updateManagementExhibition(id, exhibitionData) {
        try {
            const updatedExhibition = await this.exhibitionRepository.updateExhibition(id, exhibitionData);
            return updatedExhibition;
        } catch (error) {
            console.error('전시회 수정 중 오류:', error);
            throw error;
        }
    }

    /**
     * 관리자용: 전시회를 삭제합니다.
     * @param {string} id - 전시회 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteManagementExhibition(id) {
        try {

            const exhibition = await this.exhibitionRepository.findExhibitionById(id);

            // 전시회 이미지 존재 시 삭제
            if (exhibition.imagePublicId) {
                await this.imageService.deleteImage(exhibition.imagePublicId);
            }

            // 전시회 출품 작품 관계 삭제
            await this.artworkExhibitionRelationshipRepository.deleteArtworkExhibitionRelationshipByExhibitionId(id);

            // 전시회 삭제(hard delete)
            return await this.exhibitionRepository.deleteExhibition(id);
        } catch (error) {
            console.error('전시회 삭제 중 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회 정보를 수정합니다.
     * @param {number} id - 전시회 ID
     * @param {ExhibitionRequestDto} exhibitionDto - 전시회 수정 데이터
     * @returns {Promise<ExhibitionResponseDto>} 수정된 전시회 정보
     */
    async updateExhibition(id, exhibitionDto) {
        const existingExhibition = await this.exhibitionRepository.findById(id);
        if (!existingExhibition) {
            throw new ExhibitionNotFoundError();
        }

        return this.exhibitionRepository.update(id, exhibitionDto);
    }

    /**
     * 전시회를 삭제합니다.
     * @param {string} id - 전시회 ID
     * @returns {Promise<void>}
     */
    async deleteExhibition(id) {
        await this.getExhibitionById(id);
        await this.exhibitionRepository.delete(id);
    }

    /**
     * 모든 전시회를 조회합니다.
     * @param {Object} filterOptions - 필터링 옵션
     * @returns {Promise<Array<ExhibitionListDto>>} 전시회 목록
     */
    async getAllExhibitions(filterOptions = {}) {
        try {
            // 레포지토리에 필터 옵션을 전달하여 DB 레벨에서 필터링
            const result = await this.exhibitionRepository.findExhibitions({
                ...filterOptions,
                // 페이지네이션 기본값 설정 (컨트롤러에서 설정한 값이 있으면 해당 값 사용)
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 12,
                // 정렬 옵션
                sortField: filterOptions.sortField || 'createdAt',
                sortOrder: filterOptions.sortOrder || 'DESC'
            });

            if (result.items.length === 0) {
                return [];
            }

            // ExhibitionListDto 배열 생성
            const exhibitionListDtos = [];
            for (const exhibition of result.items) {
                // 전시회에 속한 작품 수 조회
                const countArtworksInExhibition = await this.artworkExhibitionRelationshipRepository.countArtworksInExhibition(exhibition.id);
                const exhibitionListDto = new ExhibitionListDto(exhibition);
                exhibitionListDto.artworkCount = countArtworksInExhibition;
                exhibitionListDtos.push(exhibitionListDto);
            }

            return exhibitionListDtos;
        } catch (error) {
            console.error('전시회 목록 조회 중 오류:', error);
            throw error;
        }
    }

    /**
     * 활성화된 전시회를 조회합니다.
     * @returns {Promise<Array<ExhibitionListDto>>} 활성화된 전시회 목록
     */
    async getActiveExhibitions() {
        const exhibitions = await this.exhibitionRepository.findActiveExhibitions();
        return exhibitions.map(exhibition => new ExhibitionListDto(exhibition));
    }

    /**
     * 작품 제출이 가능한 전시회를 조회합니다.
     * @returns {Promise<Array<ExhibitionSimpleDto>>} 작품 제출 가능한 전시회 목록
     */
    async findSubmittableExhibitions(artworkId = null) {
        const exhibitions = await this.exhibitionRepository.findSubmittableExhibitions(artworkId);
        return exhibitions.map(exhibition => new ExhibitionSimpleDto(exhibition));
    }

    /**
     * ID로 전시회를 조회합니다.
     * @param {number} id - 전시회 ID
     * @returns {Promise<ExhibitionResponseDto>} 전시회 상세 정보
     */
    async getExhibitionById(id) {
        const exhibition = await this.exhibitionRepository.findExhibitionById(id);
        if (!exhibition) {
            throw new ExhibitionNotFoundError(`ID가 ${id}인 전시회를 찾을 수 없습니다.`);
        }
        return new ExhibitionResponseDto(exhibition);
    }
}
