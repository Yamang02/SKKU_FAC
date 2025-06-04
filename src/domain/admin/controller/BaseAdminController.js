import logger from '../../../common/utils/Logger.js';
import ViewResolver from '../../../common/utils/ViewResolver.js';
import { ViewPath } from '../../../common/constants/ViewPath.js';

/**
 * Admin 컨트롤러들의 기본 클래스
 * 공통 에러 처리, 응답 패턴, 로깅을 제공합니다.
 */
export default class BaseAdminController {
    constructor(controllerName = 'AdminController') {
        this.controllerName = controllerName;
    }

    /**
     * 안전한 비동기 작업 실행 (SSR 페이지용)
     * @param {Function} operation - 실행할 비동기 함수
     * @param {Object} req - Express request 객체
     * @param {Object} res - Express response 객체
     * @param {Object} options - 옵션
     * @returns {Promise<void>}
     */
    async safeExecuteSSR(operation, req, res, options = {}) {
        const {
            operationName = '작업',
            errorRedirectPath = '/admin',
            errorMessage = null,
            successRedirectPath = null,
            successMessage = null
        } = options;

        try {
            const result = await operation();

            // 성공 로깅
            this.logSuccess(operationName, {
                userId: req.user?.id,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                method: req.method,
                url: req.originalUrl
            });

            // 성공 메시지 설정
            if (successMessage) {
                req.flash('success', successMessage);
            }

            // 리다이렉트 또는 결과 반환
            if (successRedirectPath) {
                return res.redirect(successRedirectPath);
            }

            return result;
        } catch (error) {
            // 에러 로깅
            this.logError(operationName, error, {
                userId: req.user?.id,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                method: req.method,
                url: req.originalUrl,
                body: this.sanitizeRequestData(req.body),
                params: req.params,
                query: req.query
            });

            // 사용자 친화적 에러 메시지
            const userErrorMessage = errorMessage || this.getUserFriendlyErrorMessage(error);
            req.flash('error', userErrorMessage);

            return res.redirect(errorRedirectPath);
        }
    }

    /**
     * 안전한 비동기 작업 실행 (API용)
     * @param {Function} operation - 실행할 비동기 함수
     * @param {Object} req - Express request 객체
     * @param {Object} res - Express response 객체
     * @param {Object} options - 옵션
     * @returns {Promise<void>}
     */
    async safeExecuteAPI(operation, req, res, options = {}) {
        const { operationName = '작업', successStatus = 200, errorStatus = 500 } = options;

        try {
            const result = await operation();

            // 성공 로깅
            this.logSuccess(operationName, {
                userId: req.user?.id,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                method: req.method,
                url: req.originalUrl
            });

            return res.status(successStatus).json({
                success: true,
                data: result
            });
        } catch (error) {
            // 에러 로깅
            this.logError(operationName, error, {
                userId: req.user?.id,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                method: req.method,
                url: req.originalUrl,
                body: this.sanitizeRequestData(req.body),
                params: req.params,
                query: req.query
            });

            // API 에러 응답
            const statusCode = this.getErrorStatusCode(error);
            const userErrorMessage = this.getUserFriendlyErrorMessage(error);

            return res.status(statusCode || errorStatus).json({
                success: false,
                error: userErrorMessage,
                ...(process.env.NODE_ENV === 'development' && {
                    details: error.message,
                    stack: error.stack
                })
            });
        }
    }

    /**
     * 에러 페이지 렌더링
     * @param {Object} res - Express response 객체
     * @param {Error} error - 발생한 에러
     * @param {Object} options - 렌더링 옵션
     */
    renderErrorPage(res, error, options = {}) {
        const { title = '오류 발생', message = null, statusCode = 500 } = options;

        const userErrorMessage = message || this.getUserFriendlyErrorMessage(error);

        return ViewResolver.render(res.status(statusCode), ViewPath.ERROR, {
            title,
            error: userErrorMessage,
            ...(process.env.NODE_ENV === 'development' && {
                details: error.message,
                stack: error.stack
            })
        });
    }

    /**
     * 성공 로깅
     * @param {string} operation - 작업명
     * @param {Object} context - 컨텍스트 정보
     */
    logSuccess(operation, context = {}) {
        logger.info(`${this.controllerName} - ${operation} 성공`, {
            controller: this.controllerName,
            operation,
            ...context
        });
    }

    /**
     * 에러 로깅
     * @param {string} operation - 작업명
     * @param {Error} error - 발생한 에러
     * @param {Object} context - 컨텍스트 정보
     */
    logError(operation, error, context = {}) {
        logger.error(`${this.controllerName} - ${operation} 실패`, {
            controller: this.controllerName,
            operation,
            error: error.message,
            stack: error.stack,
            ...context
        });
    }

    /**
     * 사용자 친화적 에러 메시지 생성
     * @param {Error} error - 발생한 에러
     * @returns {string} 사용자 친화적 메시지
     */
    getUserFriendlyErrorMessage(error) {
        // 특정 에러 타입에 따른 메시지 매핑
        if (error.name === 'ValidationError') {
            return '입력 데이터가 올바르지 않습니다. 다시 확인해주세요.';
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return '이미 존재하는 데이터입니다. 다른 값을 입력해주세요.';
        }

        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return '관련된 데이터가 존재하여 작업을 완료할 수 없습니다.';
        }

        if (error.message?.includes('not found') || error.message?.includes('찾을 수 없습니다')) {
            return '요청한 데이터를 찾을 수 없습니다.';
        }

        if (error.message?.includes('permission') || error.message?.includes('권한')) {
            return '해당 작업을 수행할 권한이 없습니다.';
        }

        if (error.message?.includes('timeout')) {
            return '요청 처리 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        }

        // 기본 메시지
        return '작업 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    /**
     * 에러 상태 코드 결정
     * @param {Error} error - 발생한 에러
     * @returns {number} HTTP 상태 코드
     */
    getErrorStatusCode(error) {
        if (error.name === 'ValidationError') {
            return 400;
        }

        if (error.message?.includes('not found') || error.message?.includes('찾을 수 없습니다')) {
            return 404;
        }

        if (error.message?.includes('permission') || error.message?.includes('권한')) {
            return 403;
        }

        if (error.message?.includes('timeout')) {
            return 408;
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return 409;
        }

        return 500;
    }

    /**
     * 요청 데이터 민감정보 제거
     * @param {Object} data - 요청 데이터
     * @returns {Object} 정제된 데이터
     */
    sanitizeRequestData(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }

        const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
        const sanitized = { ...data };

        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }

    /**
     * 페이지네이션 헬퍼
     * @param {number} page - 현재 페이지
     * @param {number} limit - 페이지당 항목 수
     * @param {number} total - 전체 항목 수
     * @returns {Object} 페이지네이션 정보
     */
    createPaginationInfo(page, limit, total) {
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNext,
            hasPrev,
            nextPage: hasNext ? page + 1 : null,
            prevPage: hasPrev ? page - 1 : null
        };
    }

    /**
     * 표준 목록 응답 생성
     * @param {Array} items - 항목 목록
     * @param {Object} pagination - 페이지네이션 정보
     * @param {Object} filters - 적용된 필터
     * @returns {Object} 표준화된 응답
     */
    createListResponse(items, pagination, filters = {}) {
        return {
            items,
            pagination,
            filters,
            meta: {
                timestamp: new Date().toISOString(),
                controller: this.controllerName
            }
        };
    }
}
