import ExhibitionService from '../../../exhibition/service/ExhibitionService.js';
import ExhibitionManagementDto from '../../model/dto/exhibition/ExhibitionManagementDto.js';
import ExhibitionListManagementDto from '../../model/dto/exhibition/ExhibitionListManagementDto.js';
import ExhibitionListManagementDataDto from '../../model/dto/exhibition/ExhibitionListManagementDataDto.js';
import Page from '../../../common/model/Page.js';
import { generateDomainUUID, DOMAINS } from '../../../../common/utils/uuid.js';

export default class ExhibitionManagementService {
    constructor() {
        this.exhibitionService = new ExhibitionService();
    }

    /**
     * 전시회 목록을 조회합니다.
     * @param {Object} options - 페이지네이션 및 필터 옵션
     * @returns {Promise<ExhibitionListManagementDataDto>} 전시회 목록 데이터
     */
    async getExhibitionList(options) {
        try {
            const { page = 1, limit = 10, exhibitionType, featured, year, keyword } = options;

            // 옵션 변환
            const serviceOptions = {
                page,
                limit,
                exhibitionType,
                isFeatured: featured,
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
            const pageInfo = new Page(total, { page, limit });

            return new ExhibitionListManagementDataDto({
                exhibitions: exhibitionDtos,
                page: pageInfo,
                total,
                filters: {
                    exhibitionType,
                    featured,
                    year,
                    keyword
                }
            });
        } catch (error) {
            console.error('전시회 목록 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회 상세 정보를 조회합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @returns {Promise<ExhibitionManagementDto>} 전시회 상세 데이터
     */
    async getExhibitionDetail(exhibitionId) {
        try {
            const exhibition = await this.exhibitionService.getExhibitionById(exhibitionId);
            if (!exhibition) {
                throw new Error(`ID가 ${exhibitionId}인 전시회를 찾을 수 없습니다.`);
            }
            return new ExhibitionManagementDto(exhibition);
        } catch (error) {
            console.error('전시회 상세 조회 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 새 전시회를 생성합니다.
     * @param {Object} exhibitionData - 전시회 데이터
     * @returns {Promise<string>} 생성된 전시회 ID
     */
    async createExhibition(exhibitionData, exhibitionImage) {
        try {
            // ID 생성
            const exhibitionId = generateDomainUUID(DOMAINS.EXHIBITION);
            const exhibitionDto = new ExhibitionManagementDto(exhibitionData);

            exhibitionDto.id = exhibitionId;
            exhibitionDto.imageUrl = exhibitionImage.url;
            exhibitionDto.imagePublicId = exhibitionImage.publicId;
            // 도메인 서비스를 통해 전시회 생성
            const newExhibition = await this.exhibitionService.createManagementExhibition(
                exhibitionDto
            );

            return newExhibition;
        } catch (error) {
            console.error('전시회 생성 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회를 수정합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} exhibitionData - 수정할 전시회 데이터
     * @returns {Promise<boolean>} 성공 여부
     */
    // 업데이트 시 이미지는 처리하지 않음
    async updateExhibition(exhibitionId, exhibitionData) {
        try {
            // 도메인 서비스를 통해 전시회 수정
            const result = await this.exhibitionService.updateManagementExhibition(
                exhibitionId,
                exhibitionData
            );

            return !!result;
        } catch (error) {
            console.error('전시회 수정 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회를 삭제합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteExhibition(exhibitionId) {
        try {
            // 도메인 서비스를 통해 전시회 삭제
            return await this.exhibitionService.deleteManagementExhibition(exhibitionId);
        } catch (error) {
            console.error('전시회 삭제 서비스 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회의 주요 전시 여부를 토글합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @returns {Promise<Object>} 수정된 전시회 정보
     */
    async toggleFeatured(exhibitionId) {
        try {
            const exhibition = await this.exhibitionService.getExhibitionById(exhibitionId);
            if (!exhibition) {
                throw new Error(`ID가 ${exhibitionId}인 전시회를 찾을 수 없습니다.`);
            }

            const newIsFeaturedValue = !exhibition.isFeatured;

            // 기존 값의 반대로 설정 - 오직 isFeatured 필드만 변경하고 나머지는 유지
            const updatedExhibition = await this.exhibitionService.updateManagementExhibition(
                exhibitionId,
                { isFeatured: newIsFeaturedValue }
            );

            return updatedExhibition;
        } catch (error) {
            console.error('전시회 주요 전시 설정 오류:', error);
            throw error;
        }
    }
}
