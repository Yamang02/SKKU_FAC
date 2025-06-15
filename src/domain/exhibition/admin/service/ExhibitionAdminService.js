import ExhibitionService from '#domain/exhibition/service/ExhibitionService.js';
import ExhibitionManagementDto from '#domain/admin/model/dto/exhibition/ExhibitionManagementDto.js';
import ExhibitionListManagementDto from '#domain/admin/model/dto/exhibition/ExhibitionListManagementDto.js';
import ExhibitionListManagementDataDto from '#domain/admin/model/dto/exhibition/ExhibitionListManagementDataDto.js';
import { generateDomainUUID, DOMAINS } from '#common/utils/uuid.js';
import BaseAdminService from '#domain/admin/service/BaseAdminService.js';

export default class ExhibitionAdminService extends BaseAdminService {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['ExhibitionService'];

    constructor(exhibitionService = null) {
        super('ExhibitionAdminService');

        // 의존성 주입 방식 (새로운 방식)
        if (exhibitionService) {
            this.exhibitionService = exhibitionService;
        } else {
            // 기존 방식 호환성 유지 (임시)
            throw new Error('ExhibitionService가 주입되지 않았습니다.');
        }
    }

    /**
     * 전시회 목록을 조회합니다.
     * @param {Object} options - 페이지네이션 및 필터 옵션
     * @returns {Promise<ExhibitionListManagementDataDto>} 전시회 목록 데이터
     */
    async getExhibitionList(options) {
        return this.safeExecute(
            async () => {
                const normalizedOptions = this.normalizeFilterOptions(options);
                const { page, limit, exhibitionType, isFeatured, year, keyword } = normalizedOptions;

                // 옵션 변환
                const serviceOptions = {
                    page,
                    limit,
                    exhibitionType,
                    isFeatured,
                    year,
                    search: keyword
                };

                // 도메인 서비스를 통해 전시회 목록 조회
                const result = await this.exhibitionService.getManagementExhibitions(serviceOptions);
                const exhibitions = result.items || [];
                const total = result.total || 0;

                // DTO 변환
                const exhibitionDtos = exhibitions.map(exhibition => new ExhibitionListManagementDto(exhibition));

                // 페이지네이션 정보 생성
                const pageInfo = this.createPagination(total, options);

                return new ExhibitionListManagementDataDto({
                    exhibitions: exhibitionDtos,
                    page: pageInfo,
                    total,
                    filters: {
                        exhibitionType,
                        featured: isFeatured,
                        year,
                        keyword
                    }
                });
            },
            '전시회 목록 조회',
            { options }
        );
    }

    /**
     * 전시회 상세 정보를 조회합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @returns {Promise<ExhibitionManagementDto>} 전시회 상세 데이터
     */
    async getExhibitionDetail(exhibitionId) {
        return this.safeExecute(
            async () => {
                const exhibition = await this.exhibitionService.getExhibitionById(exhibitionId);
                if (!exhibition) {
                    throw new Error(`ID가 ${exhibitionId}인 전시회를 찾을 수 없습니다.`);
                }
                return new ExhibitionManagementDto(exhibition);
            },
            '전시회 상세 조회',
            { exhibitionId }
        );
    }

    /**
     * 새 전시회를 생성합니다.
     * @param {Object} exhibitionData - 전시회 데이터
     * @param {Object} exhibitionImage - 전시회 이미지 정보
     * @returns {Promise<Object>} 생성된 전시회 객체
     */
    async createExhibition(exhibitionData, exhibitionImage) {
        return this.safeExecute(
            async () => {
                // ID 생성
                const exhibitionId = generateDomainUUID(DOMAINS.EXHIBITION);
                const exhibitionDto = new ExhibitionManagementDto(exhibitionData);

                exhibitionDto.id = exhibitionId;
                exhibitionDto.imageUrl = exhibitionImage.url;
                exhibitionDto.imagePublicId = exhibitionImage.publicId;

                // 도메인 서비스를 통해 전시회 생성
                const newExhibition = await this.exhibitionService.createManagementExhibition(exhibitionDto);

                return newExhibition;
            },
            '전시회 생성',
            { exhibitionData, exhibitionImage }
        );
    }

    /**
     * 전시회를 수정합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} exhibitionData - 수정할 전시회 데이터
     * @returns {Promise<boolean>} 성공 여부
     */
    async updateExhibition(exhibitionId, exhibitionData) {
        return this.safeExecute(
            async () => {
                // 도메인 서비스를 통해 전시회 수정
                const result = await this.exhibitionService.updateManagementExhibition(exhibitionId, exhibitionData);

                return !!result;
            },
            '전시회 수정',
            { exhibitionId, exhibitionData }
        );
    }

    /**
     * 전시회를 삭제합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteExhibition(exhibitionId) {
        return this.safeExecute(
            async () => {
                // 도메인 서비스를 통해 전시회 삭제
                return await this.exhibitionService.deleteManagementExhibition(exhibitionId);
            },
            '전시회 삭제',
            { exhibitionId }
        );
    }

    /**
     * 전시회의 주요 전시 여부를 토글합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @returns {Promise<Object>} 수정된 전시회 정보
     */
    async toggleFeatured(exhibitionId) {
        return this.safeExecute(
            async () => {
                const exhibition = await this.exhibitionService.getExhibitionById(exhibitionId);
                if (!exhibition) {
                    throw new Error(`ID가 ${exhibitionId}인 전시회를 찾을 수 없습니다.`);
                }

                const newIsFeaturedValue = !exhibition.isFeatured;

                // 기존 값의 반대로 설정 - 오직 isFeatured 필드만 변경하고 나머지는 유지
                const updatedExhibition = await this.exhibitionService.updateManagementExhibition(exhibitionId, {
                    isFeatured: newIsFeaturedValue
                });

                return updatedExhibition;
            },
            '전시회 주요 전시 설정',
            { exhibitionId }
        );
    }

    /**
     * 전시회 상태를 변경합니다. (ExhibitionService의 changeExhibitionStatus 활용)
     * @param {string} exhibitionId - 전시회 ID
     * @param {string} newStatus - 새로운 상태
     * @param {Object} options - 추가 옵션
     * @returns {Promise<Object>} 상태 변경된 전시회 정보
     */
    async changeExhibitionStatus(exhibitionId, newStatus, options = {}) {
        return this.safeExecute(
            async () => {
                // ExhibitionService의 상태 변경 메서드 활용 (중복 제거)
                return await this.exhibitionService.changeExhibitionStatus(exhibitionId, newStatus, options);
            },
            '전시회 상태 변경',
            { exhibitionId, newStatus, options }
        );
    }

    /**
     * 전시회 제출 상태를 업데이트합니다. (ExhibitionService의 updateSubmissionStatus 활용)
     * @param {string} exhibitionId - 전시회 ID
     * @param {boolean} isOpen - 제출 열림 여부
     * @returns {Promise<Object>} 업데이트된 전시회 정보
     */
    async updateSubmissionStatus(exhibitionId, isOpen) {
        return this.safeExecute(
            async () => {
                // ExhibitionService의 제출 상태 업데이트 메서드 활용 (중복 제거)
                return await this.exhibitionService.updateSubmissionStatus(exhibitionId, isOpen);
            },
            '전시회 제출 상태 업데이트',
            { exhibitionId, isOpen }
        );
    }

    /**
     * 상태별 전시회 목록을 조회합니다. (ExhibitionService의 getExhibitionsByStatus 활용)
     * @param {string} status - 전시회 상태
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Object>} 상태별 전시회 목록
     */
    async getExhibitionsByStatus(status, options = {}) {
        return this.safeExecute(
            async () => {
                // ExhibitionService의 상태별 조회 메서드 활용 (중복 제거)
                const result = await this.exhibitionService.getExhibitionsByStatus(status, options);

                // DTO 변환
                const exhibitions = result.items || [];
                const exhibitionDtos = exhibitions.map(exhibition => new ExhibitionListManagementDto(exhibition));

                return {
                    ...result,
                    items: exhibitionDtos
                };
            },
            '상태별 전시회 목록 조회',
            { status, options }
        );
    }
}
