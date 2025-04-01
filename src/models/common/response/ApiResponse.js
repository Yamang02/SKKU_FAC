/**
 * API 응답 기본 클래스
 */
export class ApiResponse {
    constructor(success, data = null, error = null) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }

    /**
     * 성공 응답 생성
     * @param {any} data - 응답 데이터
     * @returns {ApiResponse} 성공 응답 객체
     */
    static success(data) {
        return new ApiResponse(true, data);
    }

    /**
     * 에러 응답 생성
     * @param {string} error - 에러 메시지
     * @returns {ApiResponse} 에러 응답 객체
     */
    static error(error) {
        return new ApiResponse(false, null, error);
    }

    /**
     * JSON 형식으로 변환
     * @returns {Object} JSON 객체
     */
    toJSON() {
        return {
            success: this.success,
            data: this.data,
            error: this.error,
            timestamp: this.timestamp
        };
    }
}
