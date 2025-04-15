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
            const { page = 1, limit = 10, exhibitionType, isFeatured, search } = options;
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
            return await this.exhibitionRepository.updateExhibition(id, exhibitionData);
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
     * @returns {Promise<Array<ExhibitionListDto>>} 전시회 목록
     */
    async getAllExhibitions() {
        const result = await this.exhibitionRepository.findExhibitions();
        if (result.items.length > 0) {
            const exhibitionListDtos = [];
            for (const exhibition of result.items) {
                // 전시회에 속한 작품 수 조회
                const CountArtworksInExhibition = await this.artworkExhibitionRelationshipRepository.countArtworksInExhibition(exhibition.id);
                const exhibitionListDto = new ExhibitionListDto(exhibition);
                exhibitionListDto.artworkCount = CountArtworksInExhibition;
                exhibitionListDtos.push(exhibitionListDto);
            }

            return exhibitionListDtos;
        } else {
            return [];
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
