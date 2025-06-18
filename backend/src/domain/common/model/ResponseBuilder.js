import environmentManager from '../../../config/EnvironmentManager.js';

/**
 * 표준화된 API 응답을 생성하는 ResponseBuilder 클래스
 * 일관된 응답 형식을 보장하고 메타데이터를 지원합니다.
 */
export default class ResponseBuilder {
    constructor() {
        this.response = {
            success: true,
            statusCode: 200,
            message: null,
            data: null,
            metadata: {},
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * 성공 응답을 생성합니다.
     * @param {any} data - 응답 데이터
     * @param {string} message - 성공 메시지
     * @param {number} statusCode - HTTP 상태 코드 (기본값: 200)
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static success(data = null, message = null, statusCode = 200) {
        const builder = new ResponseBuilder();
        builder.response.success = true;
        builder.response.statusCode = statusCode;
        builder.response.message = message;
        builder.response.data = data;
        return builder;
    }

    /**
     * 에러 응답을 생성합니다.
     * @param {string|Error} error - 에러 메시지 또는 에러 객체
     * @param {number} statusCode - HTTP 상태 코드 (기본값: 500)
     * @param {string} errorCode - 에러 코드
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static error(error, statusCode = 500, errorCode = null) {
        const builder = new ResponseBuilder();
        builder.response.success = false;
        builder.response.statusCode = statusCode;

        if (error instanceof Error) {
            builder.response.message = error.message;
            builder.response.data = {
                errorCode: errorCode || error.name,
                details: error.details || null,
                stack: environmentManager.is('enableStackTrace') ? error.stack : undefined
            };
        } else {
            builder.response.message = error;
            builder.response.data = {
                errorCode: errorCode || 'UNKNOWN_ERROR',
                details: null
            };
        }

        return builder;
    }

    /**
     * 페이지네이션된 응답을 생성합니다.
     * @param {Array} items - 데이터 배열
     * @param {object} pagination - 페이지네이션 정보
     * @param {string} message - 성공 메시지
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static paginated(items, pagination, message = null) {
        const builder = new ResponseBuilder();
        builder.response.success = true;
        builder.response.statusCode = 200;
        builder.response.message = message;
        builder.response.data = {
            items: items || [],
            pagination: {
                currentPage: pagination.currentPage || 1,
                totalPages: pagination.totalPages || 1,
                totalItems: pagination.totalItems || 0,
                itemsPerPage: pagination.itemsPerPage || 10,
                hasNext: pagination.hasNext || false,
                hasPrev: pagination.hasPrev || false
            }
        };
        return builder;
    }

    /**
     * 메타데이터를 추가합니다.
     * @param {string} key - 메타데이터 키
     * @param {any} value - 메타데이터 값
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    addMetadata(key, value) {
        this.response.metadata[key] = value;
        return this;
    }

    /**
     * 여러 메타데이터를 한번에 추가합니다.
     * @param {object} metadata - 메타데이터 객체
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    setMetadata(metadata) {
        this.response.metadata = { ...this.response.metadata, ...metadata };
        return this;
    }

    /**
     * 응답 메시지를 설정합니다.
     * @param {string} message - 응답 메시지
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    setMessage(message) {
        this.response.message = message;
        return this;
    }

    /**
     * HTTP 상태 코드를 설정합니다.
     * @param {number} statusCode - HTTP 상태 코드
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    setStatusCode(statusCode) {
        this.response.statusCode = statusCode;
        return this;
    }

    /**
     * API 버전을 설정합니다.
     * @param {string} version - API 버전
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    setVersion(version) {
        this.response.version = version;
        return this;
    }

    /**
     * 최종 응답 객체를 반환합니다.
     * @returns {object} 표준화된 응답 객체
     */
    build() {
        // 빈 메타데이터 제거
        if (Object.keys(this.response.metadata).length === 0) {
            delete this.response.metadata;
        }

        return { ...this.response };
    }

    /**
     * Express Response 객체로 응답을 전송합니다.
     * @param {Response} res - Express Response 객체
     * @returns {Response} Express Response 객체
     */
    send(res) {
        const response = this.build();
        return res.status(response.statusCode).json(response);
    }

    // 편의 메서드들

    /**
     * 생성 성공 응답 (201)
     * @param {any} data - 생성된 데이터
     * @param {string} message - 성공 메시지
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static created(data, message = 'Resource created successfully') {
        return ResponseBuilder.success(data, message, 201);
    }

    /**
     * 업데이트 성공 응답 (200)
     * @param {any} data - 업데이트된 데이터
     * @param {string} message - 성공 메시지
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static updated(data, message = 'Resource updated successfully') {
        return ResponseBuilder.success(data, message, 200);
    }

    /**
     * 삭제 성공 응답 (204)
     * @param {string} message - 성공 메시지
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static deleted(message = 'Resource deleted successfully') {
        return ResponseBuilder.success(null, message, 204);
    }

    /**
     * 잘못된 요청 에러 (400)
     * @param {string} message - 에러 메시지
     * @param {string} errorCode - 에러 코드
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static badRequest(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
        return ResponseBuilder.error(message, 400, errorCode);
    }

    /**
     * 인증 실패 에러 (401)
     * @param {string} message - 에러 메시지
     * @param {string} errorCode - 에러 코드
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
        return ResponseBuilder.error(message, 401, errorCode);
    }

    /**
     * 권한 없음 에러 (403)
     * @param {string} message - 에러 메시지
     * @param {string} errorCode - 에러 코드
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static forbidden(message = 'Forbidden', errorCode = 'FORBIDDEN') {
        return ResponseBuilder.error(message, 403, errorCode);
    }

    /**
     * 리소스 없음 에러 (404)
     * @param {string} message - 에러 메시지
     * @param {string} errorCode - 에러 코드
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
        return ResponseBuilder.error(message, 404, errorCode);
    }

    /**
     * 충돌 에러 (409)
     * @param {string} message - 에러 메시지
     * @param {string} errorCode - 에러 코드
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static conflict(message = 'Conflict', errorCode = 'CONFLICT') {
        return ResponseBuilder.error(message, 409, errorCode);
    }

    /**
     * 유효성 검사 실패 에러 (422)
     * @param {string} message - 에러 메시지
     * @param {object} validationErrors - 유효성 검사 에러 상세
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static validationError(message = 'Validation failed', validationErrors = null) {
        const builder = ResponseBuilder.error(message, 422, 'VALIDATION_ERROR');
        if (validationErrors) {
            builder.response.data.validationErrors = validationErrors;
        }
        return builder;
    }

    /**
     * 서버 내부 에러 (500)
     * @param {string} message - 에러 메시지
     * @param {string} errorCode - 에러 코드
     * @returns {ResponseBuilder} 체이닝을 위한 인스턴스
     */
    static internalError(message = 'Internal Server Error', errorCode = 'INTERNAL_ERROR') {
        return ResponseBuilder.error(message, 500, errorCode);
    }
}
