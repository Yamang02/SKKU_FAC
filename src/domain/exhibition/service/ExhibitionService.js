/**
 * 전시회 서비스
 * 전시회 관련 비즈니스 로직을 처리합니다.
 */
import ExhibitionRepository from '../../../infrastructure/db/repository/ExhibitionRepository.js';
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
        return result.items.map(exhibition => new ExhibitionListDto(exhibition));
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
    async findSubmittableExhibitions() {
        const exhibitions = await this.exhibitionRepository.findSubmittableExhibitions();
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
