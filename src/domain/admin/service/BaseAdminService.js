import logger from '../../../common/utils/Logger.js';
import Page from '../../common/model/Page.js';

/**
 * Admin 서비스들의 기본 클래스
 * 공통 기능과 패턴을 제공합니다.
 */
export default class BaseAdminService {
    constructor(serviceName = 'AdminService') {
        this.serviceName = serviceName;
    }

    /**
     * 에러를 로깅하고 재던집니다.
     * @param {string} operation - 수행 중인 작업명
     * @param {Error} error - 발생한 에러
     * @param {string} customMessage - 사용자 정의 에러 메시지
     */
    handleError(operation, error, customMessage = null) {
        const errorMessage = customMessage || `${operation} 중 오류가 발생했습니다.`;
        logger.error(`${this.serviceName} - ${operation} 오류:`, {
            error: error.message,
            stack: error.stack,
            operation,
            service: this.serviceName
        });
        throw new Error(errorMessage);
    }

    /**
     * 작업 성공을 로깅합니다.
     * @param {string} operation - 수행한 작업명
     * @param {Object} metadata - 추가 메타데이터
     */
    logSuccess(operation, metadata = {}) {
        logger.info(`${this.serviceName} - ${operation} 성공`, {
            operation,
            service: this.serviceName,
            ...metadata
        });
    }

    /**
     * 페이지네이션 정보를 생성합니다.
     * @param {number} total - 전체 항목 수
     * @param {Object} options - 페이지네이션 옵션
     * @param {string} baseUrl - 기본 URL
     * @returns {Page} 페이지네이션 객체
     */
    createPagination(total, options, baseUrl = '') {
        const { page = 1, limit = 10 } = options;
        return new Page(total, { page, limit, baseUrl });
    }

    /**
     * 목록 조회 결과를 표준 형식으로 반환합니다.
     * @param {Array} items - 항목 배열
     * @param {number} total - 전체 항목 수
     * @param {Object} options - 페이지네이션 옵션
     * @param {Object} filters - 필터 정보
     * @param {string} baseUrl - 기본 URL
     * @returns {Object} 표준화된 목록 응답
     */
    createListResponse(items, total, options, filters = {}, baseUrl = '') {
        const page = this.createPagination(total, options, baseUrl);

        return {
            items: items || [],
            total: total || 0,
            page,
            filters
        };
    }

    /**
     * 엔티티의 featured 상태를 토글합니다.
     * @param {string} id - 엔티티 ID
     * @param {Object} repository - 레포지토리 객체
     * @param {string} entityName - 엔티티 이름 (로깅용)
     * @returns {Promise<Object>} 업데이트된 엔티티
     */
    async toggleEntityFeatured(id, repository, entityName = 'Entity') {
        try {
            // 현재 엔티티 조회
            const entity = await repository.findById ?
                await repository.findById(id) :
                await repository.findArtworkById(id);

            if (!entity) {
                throw new Error(`${entityName}을(를) 찾을 수 없습니다.`);
            }

            // featured 상태 토글
            const updateData = { isFeatured: !entity.isFeatured };

            const updatedEntity = await repository.updateArtwork ?
                await repository.updateArtwork(id, updateData) :
                await repository.update(id, updateData);

            this.logSuccess(`${entityName} featured 토글`, {
                id,
                newFeaturedStatus: !entity.isFeatured
            });

            return updatedEntity;
        } catch (error) {
            this.handleError(`${entityName} featured 토글`, error);
        }
    }

    /**
     * 엔티티 삭제를 처리합니다.
     * @param {string} id - 엔티티 ID
     * @param {Object} service - 도메인 서비스 객체
     * @param {string} entityName - 엔티티 이름 (로깅용)
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteEntity(id, service, entityName = 'Entity') {
        try {
            const result = await service.deleteArtwork ?
                await service.deleteArtwork(id) :
                await service.delete(id);

            this.logSuccess(`${entityName} 삭제`, { id });
            return result;
        } catch (error) {
            this.handleError(`${entityName} 삭제`, error);
        }
    }

    /**
     * 필터 옵션을 정규화합니다.
     * @param {Object} options - 원본 옵션
     * @returns {Object} 정규화된 옵션
     */
    normalizeFilterOptions(options) {
        const {
            page = 1,
            limit = 10,
            keyword,
            status,
            isFeatured,
            sortField = 'createdAt',
            sortOrder = 'desc',
            ...otherFilters
        } = options;

        const normalizedOptions = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortField,
            sortOrder
        };

        // 선택적 필터들 추가
        if (keyword) normalizedOptions.keyword = keyword;
        if (status) normalizedOptions.status = status;

        // isFeatured 처리
        if (isFeatured === 'true') {
            normalizedOptions.isFeatured = true;
        } else if (isFeatured === 'false') {
            normalizedOptions.isFeatured = false;
        }

        // 기타 필터들 추가
        Object.keys(otherFilters).forEach(key => {
            if (otherFilters[key] !== undefined && otherFilters[key] !== null) {
                normalizedOptions[key] = otherFilters[key];
            }
        });

        return normalizedOptions;
    }

    /**
     * 비동기 작업을 안전하게 실행합니다.
     * @param {Function} operation - 실행할 비동기 함수
     * @param {string} operationName - 작업명
     * @param {Object} context - 추가 컨텍스트 정보
     * @returns {Promise<any>} 작업 결과
     */
    async safeExecute(operation, operationName, context = {}) {
        try {
            const result = await operation();
            this.logSuccess(operationName, context);
            return result;
        } catch (error) {
            this.handleError(operationName, error);
        }
    }
}
