/**
 * 전시회 서비스
 * 전시회 관련 비즈니스 로직을 처리합니다.
 */
import ExhibitionRepository from '#infrastructure/db/repository/ExhibitionRepository.js';
import ArtworkExhibitionRelationshipRepository from '#infrastructure/db/repository/relationship/ArtworkExhibitionRelationshipRepository.js';
import ImageService from '#domain/image/service/ImageService.js';
import { ExhibitionNotFoundError } from '#common/error/ExhibitionError.js';
import ExhibitionResponseDto from '../model/dto/ExhibitionResponseDto.js';
import ExhibitionListDto from '../model/dto/ExhibitionListDto.js';
import ExhibitionSimpleDto from '../model/dto/ExhibitionSimpleDto.js';
import Exhibition from '#infrastructure/db/model/entity/Exhibition.js';
import logger from '#common/utils/Logger.js';

/**
 * 전시회 서비스
 */
export default class ExhibitionService {
    // 의존성 주입을 위한 static dependencies 정의
    static dependencies = ['ExhibitionRepository', 'ImageService', 'ArtworkExhibitionRelationshipRepository'];

    constructor(exhibitionRepository = null, imageService = null, artworkExhibitionRelationshipRepository = null) {
        // 의존성 주입이 되지 않은 경우 기본 인스턴스 생성 (하위 호환성)
        this.exhibitionRepository = exhibitionRepository || new ExhibitionRepository();
        this.imageService = imageService || new ImageService();
        this.artworkExhibitionRelationshipRepository = artworkExhibitionRelationshipRepository || new ArtworkExhibitionRelationshipRepository();
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
        const result = await this.exhibitionRepository.findFeaturedExhibitions(limit);
        const exhibitions = result.items || []; // findAll returns {items: [], total: n, pagination: false}
        const exhibitionSimpleDtos = [];
        if (exhibitions.length > 0) {
            for (const exhibition of exhibitions) {
                const exhibitionSimpleDto = new ExhibitionSimpleDto(exhibition);
                exhibitionSimpleDtos.push(exhibitionSimpleDto);
            }
        }
        return exhibitionSimpleDtos;
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

    /**
     * 전시회에 출품된 작품 목록을 조회합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Object>} 작품 목록과 페이지네이션 정보
     */
    async getExhibitionArtworks(exhibitionId, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;

            // 전시회 존재 확인
            await this.getExhibitionById(exhibitionId);

            // 전시회에 속한 작품들을 관계 테이블을 통해 조회
            const result = await this.artworkExhibitionRelationshipRepository.findArtworksByExhibitionId(exhibitionId, {
                page,
                limit
            });

            return result;
        } catch (error) {
            logger.error('전시회 작품 목록 조회 중 오류:', error);
            throw error;
        }
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
            logger.error('전시회 목록 조회 중 오류:', error);
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
            logger.error('전시회 생성 중 오류:', error);
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
            logger.error('전시회 수정 중 오류:', error);
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

            // 전시회 출품 작품 관계 삭제
            await this.artworkExhibitionRelationshipRepository.deleteArtworkExhibitionRelationshipByExhibitionId(id);

            // 전시회 삭제(hard delete)
            const deleteResult = await this.exhibitionRepository.deleteExhibition(id);

            // 전시회 이미지 존재 시 백그라운드에서 삭제 (비동기 처리)
            if (exhibition.imagePublicId) {
                // 백그라운드에서 이미지 삭제 (에러가 발생해도 전시회 삭제는 성공으로 처리)
                this.imageService
                    .deleteImage(exhibition.imagePublicId)
                    .then(() => {
                        logger.success('전시회 이미지 삭제 완료', {
                            exhibitionId: id,
                            publicId: exhibition.imagePublicId
                        });
                    })
                    .catch(error => {
                        logger.error('전시회 이미지 삭제 실패', error, {
                            exhibitionId: id,
                            publicId: exhibition.imagePublicId
                        });
                        // 이미지 삭제 실패는 로그만 남기고 전시회 삭제는 성공으로 처리
                    });
            }

            return deleteResult;
        } catch (error) {
            logger.error('전시회 삭제 중 오류:', error);
            throw error;
        }
    }

    /**
     * 전시회 정보를 수정합니다. (레거시 메서드 - updateManagementExhibition 사용 권장)
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
     * 전시회를 삭제합니다. (레거시 메서드 - deleteManagementExhibition 사용 권장)
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
                const countArtworksInExhibition =
                    await this.artworkExhibitionRelationshipRepository.countArtworksInExhibition(exhibition.id);
                const exhibitionListDto = new ExhibitionListDto(exhibition);
                exhibitionListDto.artworkCount = countArtworksInExhibition;
                exhibitionListDtos.push(exhibitionListDto);
            }

            return exhibitionListDtos;
        } catch (error) {
            logger.error('전시회 목록 조회 중 오류:', error);
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

    // ===== 전시회 상태 관리 메서드 (리팩토링됨) =====
    /**
     * 전시회의 현재 상태를 데이터베이스에서 조회합니다.
     * @param {Object} exhibition - 전시회 객체
     * @returns {string} 전시회 상태
     * @deprecated 이제 exhibition.status를 직접 사용하세요
     */
    calculateExhibitionStatus(exhibition) {
        logger.warn('calculateExhibitionStatus는 deprecated입니다. exhibition.status를 직접 사용하세요.');
        return exhibition.status || 'planning';
    }

    /**
     * 전시회 상태 전환이 유효한지 검증합니다.
     * @param {string} currentStatus - 현재 상태
     * @param {string} newStatus - 새로운 상태
     * @returns {boolean} 전환 가능 여부
     */
    isValidStatusTransition(currentStatus, newStatus) {
        return Exhibition.isValidStatusTransition(currentStatus, newStatus);
    }

    /**
     * 전시회 상태를 안전하게 변경합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {string} newStatus - 새로운 상태
     * @param {Object} options - 추가 옵션 (로깅, 검증 등)
     * @returns {Promise<Object>} 업데이트된 전시회
     */
    async changeExhibitionStatus(exhibitionId, newStatus, options = {}) {
        try {
            const { skipValidation = false, reason = '', userId = null } = options;

            const exhibition = await this.getExhibitionById(exhibitionId);
            const currentStatus = exhibition.status;

            // 상태 전환 검증 (skipValidation이 true가 아닌 경우)
            if (!skipValidation && !this.isValidStatusTransition(currentStatus, newStatus)) {
                throw new Error(
                    `잘못된 상태 전환: ${currentStatus} → ${newStatus}. 허용되는 전환: ${Exhibition.getValidTransitions(currentStatus).join(', ')}`
                );
            }

            // 상태 변경 로깅
            logger.info(`전시회 상태 변경: ${exhibitionId} (${currentStatus} → ${newStatus})`, {
                exhibitionId,
                currentStatus,
                newStatus,
                reason,
                userId,
                timestamp: new Date().toISOString()
            });

            // 상태 변경과 함께 관련 필드도 업데이트
            const updateData = { status: newStatus };

            // 상태에 따른 자동 필드 업데이트
            if (newStatus === 'submission_open') {
                updateData.isSubmissionOpen = true;
            } else if (newStatus === 'review' || newStatus === 'active' || newStatus === 'completed') {
                updateData.isSubmissionOpen = false;
            }

            return await this.updateManagementExhibition(exhibitionId, updateData);
        } catch (error) {
            logger.error('전시회 상태 변경 실패:', error);
            throw error;
        }
    }

    /**
     * 전시회를 작품 제출 상태로 변경합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} options - 추가 옵션
     * @returns {Promise<Object>} 업데이트된 전시회
     */
    async openSubmissions(exhibitionId, options = {}) {
        return await this.changeExhibitionStatus(exhibitionId, 'submission_open', {
            ...options,
            reason: '작품 제출 시작'
        });
    }

    /**
     * 전시회를 심사 상태로 변경합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} options - 추가 옵션
     * @returns {Promise<Object>} 업데이트된 전시회
     */
    async startReview(exhibitionId, options = {}) {
        return await this.changeExhibitionStatus(exhibitionId, 'review', {
            ...options,
            reason: '작품 심사 시작'
        });
    }

    /**
     * 전시회를 활성화(진행 중) 상태로 변경합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} options - 추가 옵션
     * @returns {Promise<Object>} 업데이트된 전시회
     */
    async activateExhibition(exhibitionId, options = {}) {
        return await this.changeExhibitionStatus(exhibitionId, 'active', {
            ...options,
            reason: '전시회 시작'
        });
    }

    /**
     * 전시회를 완료 상태로 변경합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} options - 추가 옵션
     * @returns {Promise<Object>} 업데이트된 전시회
     */
    async completeExhibition(exhibitionId, options = {}) {
        return await this.changeExhibitionStatus(exhibitionId, 'completed', {
            ...options,
            reason: '전시회 종료'
        });
    }

    /**
     * 전시회를 기획 상태로 되돌립니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {Object} options - 추가 옵션
     * @returns {Promise<Object>} 업데이트된 전시회
     */
    async resetToPlanning(exhibitionId, options = {}) {
        return await this.changeExhibitionStatus(exhibitionId, 'planning', {
            ...options,
            reason: '기획 상태로 되돌림'
        });
    }

    /**
     * 전시회의 작품 제출 상태를 안전하게 변경합니다. (레거시 호환성)
     * @param {string} exhibitionId - 전시회 ID
     * @param {boolean} isOpen - 제출 열림 여부
     * @returns {Promise<Object>} 업데이트된 전시회
     */
    async updateSubmissionStatus(exhibitionId, isOpen) {
        try {
            const exhibition = await this.getExhibitionById(exhibitionId);
            const currentStatus = exhibition.status;

            // 완료된 전시회는 제출 상태 변경 불가
            if (currentStatus === 'completed') {
                throw new Error('완료된 전시회의 작품 제출 상태는 변경할 수 없습니다.');
            }

            // 진행 중인 전시회는 제출 상태 변경 불가
            if (currentStatus === 'active') {
                throw new Error('진행 중인 전시회의 작품 제출 상태는 변경할 수 없습니다.');
            }

            if (isOpen) {
                // 제출 열기: submission_open 상태로 변경
                if (currentStatus === 'planning') {
                    return await this.openSubmissions(exhibitionId, { reason: '레거시 API를 통한 제출 상태 변경' });
                }
            } else {
                // 제출 닫기: planning 상태로 변경
                if (currentStatus === 'submission_open') {
                    return await this.resetToPlanning(exhibitionId, { reason: '레거시 API를 통한 제출 상태 변경' });
                }
            }

            // 상태 변경이 필요 없는 경우 현재 상태 유지하면서 isSubmissionOpen만 업데이트
            return await this.updateManagementExhibition(exhibitionId, {
                isSubmissionOpen: isOpen
            });
        } catch (error) {
            logger.error('전시회 제출 상태 변경 실패:', error);
            throw error;
        }
    }

    /**
     * 전시회의 주요 전시회 상태를 안전하게 변경합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @param {boolean} isFeatured - 주요 전시회 여부
     * @returns {Promise<Object>} 업데이트된 전시회
     */
    async updateFeaturedStatus(exhibitionId, isFeatured) {
        try {
            const exhibition = await this.getExhibitionById(exhibitionId);
            const currentStatus = exhibition.status;

            // 완료된 전시회는 주요 전시회 상태 변경 불가
            if (currentStatus === 'completed') {
                throw new Error('완료된 전시회의 주요 전시회 상태는 변경할 수 없습니다.');
            }

            return await this.updateManagementExhibition(exhibitionId, {
                isFeatured: isFeatured
            });
        } catch (error) {
            logger.error('전시회 주요 상태 변경 실패:', error);
            throw error;
        }
    }

    /**
     * 전시회 상태와 함께 전시회 정보를 조회합니다.
     * @param {string} exhibitionId - 전시회 ID
     * @returns {Promise<Object>} 전시회 정보와 상태
     */
    async getExhibitionWithStatus(exhibitionId) {
        try {
            const exhibition = await this.getExhibitionById(exhibitionId);
            const status = exhibition.status;

            return {
                ...exhibition,
                currentStatus: status,
                statusDescription: Exhibition.getStatusDescription(status),
                canSubmitArtworks: status === 'submission_open',
                isActive: status === 'active',
                isCompleted: status === 'completed',
                validTransitions: Exhibition.getValidTransitions(status)
            };
        } catch (error) {
            logger.error('전시회 상태 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 상태별 전시회 목록을 조회합니다.
     * @param {string} status - 조회할 상태
     * @param {Object} options - 페이지네이션 옵션
     * @returns {Promise<Array>} 해당 상태의 전시회 목록
     */
    async getExhibitionsByStatus(status, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;

            const result = await this.exhibitionRepository.findExhibitions({
                status,
                page,
                limit,
                sortField: 'createdAt',
                sortOrder: 'DESC'
            });

            return result.items.map(exhibition => new ExhibitionListDto(exhibition));
        } catch (error) {
            logger.error(`상태별 전시회 조회 실패 (${status}):`, error);
            throw error;
        }
    }
}
