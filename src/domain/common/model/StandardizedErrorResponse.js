import ResponseBuilder from './ResponseBuilder.js';
import { getErrorStatusCode, getErrorCategory } from '../../../common/error/BaseError.js';

/**
 * 표준화된 에러 응답을 생성하는 클래스
 * ErrorHandler와 ResponseBuilder를 통합하여 일관된 에러 응답을 제공합니다.
 */
export default class StandardizedErrorResponse {
    /**
     * 에러 객체로부터 표준화된 응답을 생성합니다.
     * @param {Error} error - 에러 객체
     * @param {object} options - 추가 옵션
     * @param {boolean} options.includeStack - 스택 트레이스 포함 여부
     * @param {object} options.metadata - 추가 메타데이터
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static fromError(error, options = {}) {
        const { includeStack = process.env.NODE_ENV === 'development', metadata = {} } = options;

        // 에러 정보 추출
        const statusCode = getErrorStatusCode(error);
        const category = getErrorCategory(error);
        const errorCode = error.code || error.name || 'UNKNOWN_ERROR';

        // 에러 데이터 구성
        const errorData = {
            errorCode,
            category,
            details: error.details || null,
            timestamp: new Date().toISOString()
        };

        // 개발 환경에서만 스택 트레이스 포함
        if (includeStack && error.stack) {
            errorData.stack = error.stack;
        }

        // 유효성 검사 에러의 경우 추가 정보 포함
        if (error.validationErrors) {
            errorData.validationErrors = error.validationErrors;
        }

        // ResponseBuilder를 사용하여 에러 응답 생성
        const builder = ResponseBuilder.error(error.message, statusCode, errorCode).setMetadata({
            errorId: this.generateErrorId(),
            category,
            ...metadata
        });

        // 에러 데이터 설정
        builder.response.data = errorData;

        return builder;
    }

    /**
     * HTTP 상태 코드별 표준 에러 응답을 생성합니다.
     * @param {number} statusCode - HTTP 상태 코드
     * @param {string} message - 에러 메시지
     * @param {string} errorCode - 에러 코드
     * @param {object} details - 추가 상세 정보
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static createStandardError(statusCode, message, errorCode, details = null) {
        const errorData = {
            errorCode,
            category: this.getCategoryByStatusCode(statusCode),
            details,
            timestamp: new Date().toISOString()
        };

        return ResponseBuilder.error(message, statusCode, errorCode)
            .setMetadata({
                errorId: this.generateErrorId(),
                category: errorData.category
            })
            .addMetadata('errorData', errorData);
    }

    /**
     * 유효성 검사 에러 응답을 생성합니다.
     * @param {string} message - 에러 메시지
     * @param {object} validationErrors - 유효성 검사 에러 상세
     * @param {object} metadata - 추가 메타데이터
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static validationError(message = 'Validation failed', validationErrors = {}, metadata = {}) {
        const errorData = {
            errorCode: 'VALIDATION_ERROR',
            category: 'CLIENT_ERROR',
            details: 'Request validation failed',
            validationErrors,
            timestamp: new Date().toISOString()
        };

        return ResponseBuilder.error(message, 422, 'VALIDATION_ERROR')
            .setMetadata({
                errorId: this.generateErrorId(),
                category: 'CLIENT_ERROR',
                ...metadata
            })
            .addMetadata('errorData', errorData);
    }

    /**
     * 인증 에러 응답을 생성합니다.
     * @param {string} message - 에러 메시지
     * @param {object} metadata - 추가 메타데이터
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static authenticationError(message = 'Authentication required', metadata = {}) {
        return this.createStandardError(
            401,
            message,
            'AUTHENTICATION_REQUIRED',
            'Valid authentication credentials are required'
        ).setMetadata(metadata);
    }

    /**
     * 권한 에러 응답을 생성합니다.
     * @param {string} message - 에러 메시지
     * @param {object} metadata - 추가 메타데이터
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static authorizationError(message = 'Insufficient permissions', metadata = {}) {
        return this.createStandardError(
            403,
            message,
            'INSUFFICIENT_PERMISSIONS',
            'User does not have required permissions for this operation'
        ).setMetadata(metadata);
    }

    /**
     * 리소스 없음 에러 응답을 생성합니다.
     * @param {string} resource - 리소스 타입
     * @param {string} identifier - 리소스 식별자
     * @param {object} metadata - 추가 메타데이터
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static notFoundError(resource = 'Resource', identifier = null, metadata = {}) {
        const message = identifier ? `${resource} with identifier '${identifier}' not found` : `${resource} not found`;

        return this.createStandardError(404, message, 'RESOURCE_NOT_FOUND', { resource, identifier }).setMetadata(
            metadata
        );
    }

    /**
     * 서버 내부 에러 응답을 생성합니다.
     * @param {string} message - 에러 메시지
     * @param {object} metadata - 추가 메타데이터
     * @returns {ResponseBuilder} ResponseBuilder 인스턴스
     */
    static internalServerError(message = 'Internal server error', metadata = {}) {
        return this.createStandardError(
            500,
            message,
            'INTERNAL_SERVER_ERROR',
            'An unexpected error occurred while processing the request'
        ).setMetadata(metadata);
    }

    /**
     * 에러 ID를 생성합니다.
     * @returns {string} 고유한 에러 ID
     */
    static generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * HTTP 상태 코드로부터 에러 카테고리를 결정합니다.
     * @param {number} statusCode - HTTP 상태 코드
     * @returns {string} 에러 카테고리
     */
    static getCategoryByStatusCode(statusCode) {
        if (statusCode >= 400 && statusCode < 500) {
            return 'CLIENT_ERROR';
        } else if (statusCode >= 500) {
            return 'SERVER_ERROR';
        } else {
            return 'UNKNOWN';
        }
    }

    /**
     * Express 미들웨어로 사용할 수 있는 에러 핸들러를 생성합니다.
     * @param {object} options - 에러 핸들러 옵션
     * @returns {Function} Express 에러 미들웨어
     */
    static createExpressErrorHandler(options = {}) {
        return (err, req, res, next) => {
            // 이미 응답이 시작된 경우 기본 핸들러에 위임
            if (res.headersSent) {
                return next(err);
            }

            try {
                // 표준화된 에러 응답 생성
                const errorResponse = this.fromError(err, {
                    includeStack: options.includeStack,
                    metadata: {
                        requestId: req.id || req.headers['x-request-id'],
                        path: req.path,
                        method: req.method,
                        userAgent: req.get('User-Agent'),
                        ip: req.ip
                    }
                });

                // 응답 전송
                errorResponse.send(res);
            } catch (handlingError) {
                // 에러 처리 중 에러가 발생한 경우 기본 응답
                console.error('Error handling failed:', handlingError);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    timestamp: new Date().toISOString()
                });
            }
        };
    }
}
