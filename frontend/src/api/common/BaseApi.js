/**
 * 공통 API 기본 클래스
 * 모든 API 클래스의 기본 기능을 제공합니다.
 */
import api from '../api.js';
import { showErrorMessage, showSuccessMessage } from '../../utils/message.js';

export default class BaseApi {
    // AuthContext 인스턴스를 저장할 정적 변수
    static authContext = null;

    /**
     * AuthContext 설정
     * @param {Object} authContext - AuthContext 인스턴스
     */
    static setAuthContext(authContext) {
        this.authContext = authContext;
    }

    /**
     * API 파라미터를 URLSearchParams로 변환
     * @param {Object} params - 파라미터 객체
     * @returns {string} 쿼리 스트링
     */
    static buildQueryString(params = {}) {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                searchParams.append(key, value);
            }
        });

        return searchParams.toString();
    }

    /**
     * 페이지네이션과 필터를 결합하여 쿼리 스트링 생성
     * @param {Object} pagination - 페이지네이션 정보
     * @param {Object} filters - 필터 정보
     * @returns {string} 쿼리 스트링
     */
    static buildListQueryString(pagination = {}, filters = {}) {
        return this.buildQueryString({ ...pagination, ...filters });
    }

    /**
     * API 호출 시 표준 에러 처리
     * @param {Function} apiCall - API 호출 함수
     * @param {string} operationName - 작업명 (로깅용)
     * @param {boolean} showError - 에러 메시지 표시 여부
     */
    static async handleApiCall(apiCall, operationName, showError = true) {
        try {
            return await apiCall();
        } catch (error) {
            console.error(`${operationName} 중 오류 발생:`, error);

            if (showError) {
                showErrorMessage(`${operationName}에 실패했습니다.`);
            }

            throw error;
        }
    }

    /**
     * 성공 메시지와 함께 API 호출
     * @param {Function} apiCall - API 호출 함수
     * @param {string} successMessage - 성공 메시지
     * @param {string} operationName - 작업명 (로깅용)
     */
    static async handleApiCallWithSuccess(apiCall, successMessage, operationName) {
        try {
            const result = await apiCall();
            showSuccessMessage(successMessage);
            return result;
        } catch (error) {
            console.error(`${operationName} 중 오류 발생:`, error);
            showErrorMessage(`${operationName}에 실패했습니다.`);
            throw error;
        }
    }

    /**
     * FormData 생성 헬퍼
     * @param {Object} data - 데이터 객체
     * @param {File} file - 파일 객체 (선택적)
     * @param {string} fileFieldName - 파일 필드명
     * @returns {FormData} 생성된 FormData
     */
    static createFormData(data, file = null, fileFieldName = 'file') {
        const formData = new FormData();

        // 텍스트 데이터 추가
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        // 파일 추가
        if (file) {
            formData.append(fileFieldName, file);
        }

        return formData;
    }

    /**
     * 안전한 응답 반환 (에러 시 기본 구조 제공)
     * @param {string} errorMessage - 에러 메시지
     * @param {Object} defaultData - 기본 데이터 구조
     * @returns {Object} 안전한 응답 객체
     */
    static createSafeErrorResponse(errorMessage, defaultData = {}) {
        return {
            success: false,
            error: errorMessage,
            data: defaultData
        };
    }

    /**
     * 리스트 API용 안전한 응답 반환
     * @param {string} errorMessage - 에러 메시지
     * @returns {Object} 안전한 리스트 응답 객체
     */
    static createSafeListErrorResponse(errorMessage) {
        return this.createSafeErrorResponse(errorMessage, {
            items: [],
            total: 0,
            page: null
        });
    }

    // 새로운 BaseApi 메소드들

    /**
     * 인증된 GET 요청
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} params - 쿼리 파라미터
     * @returns {Promise} API 응답
     */
    static async get(endpoint, params = {}) {
        const queryString = this.buildQueryString(params);
        const url = `http://localhost:3000${endpoint}${queryString ? `?${queryString}` : ''}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url);
            return await response.json();
        }

        // fallback to original api.js
        const finalUrl = queryString ? `${endpoint}?${queryString}` : endpoint;
        return await api.get(finalUrl);
    }

    /**
     * 인증된 POST 요청
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} data - 요청 데이터
     * @returns {Promise} API 응답
     */
    static async post(endpoint, data = {}) {
        const url = `http://localhost:3000${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return await response.json();
        }

        // fallback to original api.js
        return await api.post(endpoint, data);
    }

    /**
     * 인증된 PUT 요청
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} data - 요청 데이터
     * @returns {Promise} API 응답
     */
    static async put(endpoint, data = {}) {
        const url = `http://localhost:3000${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            return await response.json();
        }

        // fallback to original api.js
        return await api.put(endpoint, data);
    }

    /**
     * 인증된 PATCH 요청
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} data - 요청 데이터
     * @returns {Promise} API 응답
     */
    static async patch(endpoint, data = {}) {
        const url = `http://localhost:3000${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
            return await response.json();
        }

        // fallback to original api.js (uses PUT)
        return await api.put(endpoint, data);
    }

    /**
     * 인증된 DELETE 요청
     * @param {string} endpoint - API 엔드포인트
     * @returns {Promise} API 응답
     */
    static async delete(endpoint) {
        const url = `http://localhost:3000${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'DELETE'
            });
            return await response.json();
        }

        // fallback to original api.js
        return await api.delete(endpoint);
    }

    /**
     * 인증된 FormData POST 요청
     * @param {string} endpoint - API 엔드포인트
     * @param {FormData} formData - FormData 객체
     * @returns {Promise} API 응답
     */
    static async postFormData(endpoint, formData) {
        const url = `http://localhost:3000${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const headers = { ...this.authContext.getAuthHeaders() };
            delete headers['Content-Type']; // FormData는 자동으로 설정됨

            const response = await this.authContext.authenticatedFetch(url, {
                method: 'POST',
                headers,
                body: formData
            });
            return await response.json();
        }

        // fallback to original api.js
        return await api.post(endpoint, formData);
    }

    /**
     * 안전한 응답 반환
     * @param {Object} response - API 응답
     * @param {Object} fallbackData - 기본 데이터 (선택적)
     * @param {string} successMessage - 성공 메시지 (선택적)
     * @returns {Object} 안전한 응답 객체
     */
    static safeResponse(response, fallbackData = null, successMessage = null) {
        if (response && response.success) {
            return {
                success: true,
                data: response.data || fallbackData?.data || {},
                message: successMessage || response.message || '작업이 완료되었습니다.'
            };
        }

        return {
            success: false,
            error: response?.error || response?.message || '요청 처리 중 오류가 발생했습니다.',
            data: fallbackData?.data || {}
        };
    }

    /**
     * 에러 응답 반환
     * @param {string} errorMessage - 에러 메시지
     * @param {Object} data - 기본 데이터 (선택적)
     * @returns {Object} 에러 응답 객체
     */
    static errorResponse(errorMessage, data = {}) {
        return {
            success: false,
            error: errorMessage,
            data
        };
    }

    /**
     * FormData 생성 헬퍼 (개선된 버전)
     * @param {Object} data - 데이터 객체
     * @returns {FormData} 생성된 FormData
     */
    static createFormData(data) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        formData.append(`${key}[${index}]`, item);
                    });
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        return formData;
    }
}
