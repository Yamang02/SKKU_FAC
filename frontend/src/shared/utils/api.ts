/**
 * API 유틸리티 - TypeScript 버전
 * React Native Web에서 이관된 API 유틸리티
 * CSRF, 에러 처리, 재시도 로직 포함
 */

import { API_CONFIG, ERROR_CODES, HTTP_STATUS } from '../config/api.config';
import { csrfManager } from './csrfManager';

// API 응답 타입 정의
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    validationErrors?: Record<string, string[]>;
}

// API 에러 클래스
export class ApiError extends Error {
    public isApiError = true;
    public statusCode: number;
    public apiResponse?: ApiResponse;

    constructor(message: string, statusCode: number, apiResponse?: ApiResponse) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.apiResponse = apiResponse;
    }
}

// 요청 옵션 타입
export interface RequestOptions extends RequestInit {
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
}

/**
 * API 응답 처리 함수
 */
const handleResponse = async <T = any>(response: Response): Promise<ApiResponse<T>> => {
    const contentType = response.headers.get('content-type');

    // HTML 응답 확인 (서버 오류 페이지인 경우)
    if (contentType && contentType.includes('text/html')) {
        console.error('서버에서 HTML 응답을 반환했습니다. 서버 오류가 발생했을 수 있습니다.');
        throw new ApiError('서버 오류가 발생했습니다. 관리자에게 문의하세요.', response.status);
    }

    try {
        const data = await response.json();

        // ApiResponse에서 성공 여부 확인
        if (!data.success) {
            const errorMessage = data.error || '요청 처리 중 오류가 발생했습니다.';
            throw new ApiError(errorMessage, response.status, data);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        } else if (error instanceof SyntaxError) {
            console.error('JSON 파싱 오류:', error);
            throw new ApiError('서버 응답을 처리할 수 없습니다. 관리자에게 문의하세요.', response.status);
        } else {
            console.error('응답 처리 중 오류:', error);
            throw error;
        }
    }
};

/**
 * 재시도 로직이 포함된 fetch 함수
 */
const fetchWithRetry = async (url: string, options: RequestOptions = {}): Promise<Response> => {
    const {
        timeout = API_CONFIG.TIMEOUT,
        retryCount = API_CONFIG.RETRY_COUNT,
        retryDelay = API_CONFIG.RETRY_DELAY,
        ...fetchOptions
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            lastError = error as Error;

            if (attempt < retryCount) {
                console.warn(`API 요청 실패 (${attempt + 1}/${retryCount + 1}), ${retryDelay}ms 후 재시도...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    throw lastError!;
};

/**
 * 메인 API 객체
 */
export const api = {
    get: async <T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
        const response = await fetchWithRetry(API_CONFIG.BASE_URL + url, {
            ...options,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        return handleResponse<T>(response);
    },

    post: async <T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
        const isFormData = data instanceof FormData;

        const requestOptions: RequestOptions = {
            ...options,
            method: 'POST',
            credentials: 'include' as RequestCredentials
        };

        try {
            if (!isFormData) {
                // JSON 데이터에 CSRF 토큰 추가
                const dataWithCSRF = await csrfManager.addToData(data || {});

                // 헤더에 CSRF 토큰 추가
                const headersWithCSRF = await csrfManager.addToHeaders({
                    'Content-Type': 'application/json',
                    ...options.headers
                });

                requestOptions.headers = headersWithCSRF;
                requestOptions.body = JSON.stringify(dataWithCSRF);
            } else {
                // FormData에 CSRF 토큰 추가
                await csrfManager.addToFormData(data);

                // 헤더에 CSRF 토큰 추가 (Content-Type은 브라우저가 자동 설정)
                const headersWithCSRF = await csrfManager.addToHeaders({
                    ...options.headers
                });

                requestOptions.headers = headersWithCSRF;
                requestOptions.body = data;
            }

            const response = await fetchWithRetry(API_CONFIG.BASE_URL + url, requestOptions);

            // CSRF 토큰 오류인 경우 토큰 갱신 후 재시도
            if (response.status === HTTP_STATUS.FORBIDDEN) {
                const responseData = await response.clone().json().catch(() => ({}));
                if (responseData.code === ERROR_CODES.CSRF_TOKEN_MISSING ||
                    responseData.code === ERROR_CODES.CSRF_TOKEN_INVALID) {
                    console.log('CSRF 토큰 오류, 토큰 갱신 후 재시도...');

                    await csrfManager.refreshToken();

                    // 요청 재구성
                    if (!isFormData) {
                        const retryDataWithCSRF = await csrfManager.addToData(data || {});
                        const retryHeadersWithCSRF = await csrfManager.addToHeaders({
                            'Content-Type': 'application/json',
                            ...options.headers
                        });
                        requestOptions.headers = retryHeadersWithCSRF;
                        requestOptions.body = JSON.stringify(retryDataWithCSRF);
                    } else {
                        // FormData는 새로 생성
                        const newFormData = new FormData();
                        for (const [key, value] of data.entries()) {
                            if (key !== '_csrf') {
                                newFormData.append(key, value);
                            }
                        }
                        await csrfManager.addToFormData(newFormData);

                        const retryHeadersWithCSRF = await csrfManager.addToHeaders({
                            ...options.headers
                        });
                        requestOptions.headers = retryHeadersWithCSRF;
                        requestOptions.body = newFormData;
                    }

                    const retryResponse = await fetchWithRetry(API_CONFIG.BASE_URL + url, requestOptions);
                    return handleResponse<T>(retryResponse);
                }
            }

            return handleResponse<T>(response);
        } catch (error) {
            console.error('POST 요청 중 오류:', error);
            throw error;
        }
    },

    put: async <T = any>(url: string, data: any = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
        try {
            const dataWithCSRF = await csrfManager.addToData(data);
            const headersWithCSRF = await csrfManager.addToHeaders({
                'Content-Type': 'application/json',
                ...options.headers
            });

            const response = await fetchWithRetry(API_CONFIG.BASE_URL + url, {
                ...options,
                method: 'PUT',
                credentials: 'include' as RequestCredentials,
                headers: headersWithCSRF,
                body: JSON.stringify(dataWithCSRF)
            });

            // CSRF 토큰 오류 재시도 로직
            if (response.status === HTTP_STATUS.FORBIDDEN) {
                const responseData = await response.clone().json().catch(() => ({}));
                if (responseData.code === ERROR_CODES.CSRF_TOKEN_MISSING ||
                    responseData.code === ERROR_CODES.CSRF_TOKEN_INVALID) {
                    console.log('CSRF 토큰 오류, 토큰 갱신 후 재시도...');

                    await csrfManager.refreshToken();
                    const retryDataWithCSRF = await csrfManager.addToData(data);
                    const retryHeadersWithCSRF = await csrfManager.addToHeaders({
                        'Content-Type': 'application/json',
                        ...options.headers
                    });

                    const retryResponse = await fetchWithRetry(API_CONFIG.BASE_URL + url, {
                        ...options,
                        method: 'PUT',
                        credentials: 'include' as RequestCredentials,
                        headers: retryHeadersWithCSRF,
                        body: JSON.stringify(retryDataWithCSRF)
                    });
                    return handleResponse<T>(retryResponse);
                }
            }

            return handleResponse<T>(response);
        } catch (error) {
            console.error('PUT 요청 중 오류:', error);
            throw error;
        }
    },

    patch: async <T = any>(url: string, data: any = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
        try {
            const dataWithCSRF = await csrfManager.addToData(data);
            const headersWithCSRF = await csrfManager.addToHeaders({
                'Content-Type': 'application/json',
                ...options.headers
            });

            const response = await fetchWithRetry(API_CONFIG.BASE_URL + url, {
                ...options,
                method: 'PATCH',
                credentials: 'include' as RequestCredentials,
                headers: headersWithCSRF,
                body: JSON.stringify(dataWithCSRF)
            });

            return handleResponse<T>(response);
        } catch (error) {
            console.error('PATCH 요청 중 오류:', error);
            throw error;
        }
    },

    delete: async <T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
        try {
            const headersWithCSRF = await csrfManager.addToHeaders({
                'Content-Type': 'application/json',
                ...options.headers
            });

            const response = await fetchWithRetry(API_CONFIG.BASE_URL + url, {
                ...options,
                method: 'DELETE',
                credentials: 'include' as RequestCredentials,
                headers: headersWithCSRF
            });

            return handleResponse<T>(response);
        } catch (error) {
            console.error('DELETE 요청 중 오류:', error);
            throw error;
        }
    }
};

// 유틸리티 함수들
export const createFilterParams = (filters: Record<string, any>): Record<string, string> => {
    const params: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params[key] = String(value);
        }
    });

    return params;
};

export const createPaginationParams = (page: number = 1, limit: number = 10) => ({
    page: String(page),
    limit: String(limit)
});

export default api;
