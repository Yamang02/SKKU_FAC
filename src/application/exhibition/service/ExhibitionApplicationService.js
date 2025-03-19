import ExhibitionDomainService from '../../../domain/exhibition/service/ExhibitionDomainService.js';
import ExhibitionDto from '../../../domain/exhibition/dto/ExhibitionDto.js';

/**
 * 전시회 애플리케이션 서비스
 * 전시회 관련 사용자 케이스를 처리합니다.
 */
class ExhibitionApplicationService {
    /**
     * @param {ExhibitionRepository} exhibitionRepository - 전시회 리포지토리
     */
    constructor(exhibitionRepository) {
        this.exhibitionRepository = exhibitionRepository;
        this.domainService = new ExhibitionDomainService();
    }

    /**
     * 모든 전시회 목록을 조회합니다.
     * @returns {Promise<Array<ExhibitionDto>>} 전시회 DTO 목록
     */
    async getAllExhibitions() {
        const exhibitions = await this.exhibitionRepository.findAll();
        return exhibitions.map(exhibition => new ExhibitionDto(exhibition));
    }

    /**
     * ID로 전시회를 조회합니다.
     * @param {number} id - 전시회 ID
     * @returns {Promise<ExhibitionDto|null>} 전시회 DTO 또는 null
     */
    async getExhibitionById(id) {
        const exhibition = await this.exhibitionRepository.findById(id);
        return exhibition ? new ExhibitionDto(exhibition) : null;
    }

    /**
     * 코드로 전시회를 조회합니다.
     * @param {string} code - 전시회 코드
     * @returns {Promise<ExhibitionDto|null>} 전시회 DTO 또는 null
     */
    async getExhibitionByCode(code) {
        const exhibition = await this.exhibitionRepository.findByCode(code);
        return exhibition ? new ExhibitionDto(exhibition) : null;
    }

    /**
     * 카테고리별 전시회 목록을 조회합니다.
     * @param {string} category - 전시회 카테고리
     * @returns {Promise<Array<ExhibitionDto>>} 전시회 DTO 목록
     */
    async getExhibitionsByCategory(category) {
        const exhibitions = await this.exhibitionRepository.findByCategory(category);
        return exhibitions.map(exhibition => new ExhibitionDto(exhibition));
    }

    /**
     * 새로운 전시회를 생성합니다.
     * @param {Object} exhibitionData - 생성할 전시회 데이터
     * @returns {Promise<ExhibitionDto>} 생성된 전시회 DTO
     */
    async createExhibition(exhibitionData) {
        this.domainService.validateExhibition(exhibitionData);
        const exhibition = await this.exhibitionRepository.create(exhibitionData);
        return new ExhibitionDto(exhibition);
    }

    /**
     * 전시회 정보를 수정합니다.
     * @param {number} id - 전시회 ID
     * @param {Object} exhibitionData - 수정할 전시회 데이터
     * @returns {Promise<ExhibitionDto|null>} 수정된 전시회 DTO 또는 null
     */
    async updateExhibition(id, exhibitionData) {
        const existingExhibition = await this.exhibitionRepository.findById(id);
        if (!existingExhibition) {
            return null;
        }

        this.domainService.validateExhibition({
            ...existingExhibition,
            ...exhibitionData
        });

        const updatedExhibition = await this.exhibitionRepository.update(id, exhibitionData);
        return new ExhibitionDto(updatedExhibition);
    }

    /**
     * 전시회를 삭제합니다.
     * @param {number} id - 전시회 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteExhibition(id) {
        return await this.exhibitionRepository.delete(id);
    }
}

export default ExhibitionApplicationService;
