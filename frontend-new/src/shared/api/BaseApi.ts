/**
 * 공통 API 기본 클래스
 */

import { api, ApiResponse } from '../utils/api';
import { showErrorMessage, showSuccessMessage } from '../utils/notification';
import { API_CONFIG } from '../config/api.config';

// 페이지네이션 타입
export interface PaginationParams {
    page?: number;
    limit?: number;
}

// 필터 타입
export interface FilterParams {
    [key: string]: string | number | boolean | null | undefined;
}

// 리스트 응답 타입
export interface ListResponse<T> {
    items: T[];
    total: number;
    page: number | null;
    totalPages?: number;
    limit?: number;
}

// AuthContext 타입 (나중에 구현될 예정)
interface AuthContextType {
    authenticatedFetch?: (url: string, options?: RequestInit) => Promise<Response>;
}

export default class BaseApi {
    // AuthContext 인스턴스를 저장할 정적 변수
    protected static authContext: AuthContextType | null = null;

    /**
     * AuthContext 설정
     */
    static setAuthContext(authContext: AuthContextType): void {
        this.authContext = authContext;
    }

    /**
     * API 파라미터를 URLSearchParams로 변환
     */
    static buildQueryString(params: Record<string, unknown> = {}): string {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                searchParams.append(key, String(value));
            }
        });

        return searchParams.toString();
    }

    /**
     * 페이지네이션과 필터를 결합하여 쿼리 스트링 생성
     */
    static buildListQueryString(
        pagination: PaginationParams = {},
        filters: FilterParams = {}
    ): string {
        return this.buildQueryString({ ...pagination, ...filters });
    }

    /**
     * API 호출 시 표준 에러 처리
     */
    static async handleApiCall<T>(
        apiCall: () => Promise<ApiResponse<T>>,
        operationName: string,
        showError: boolean = true
    ): Promise<ApiResponse<T>> {
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
     */
    static async handleApiCallWithSuccess<T>(
        apiCall: () => Promise<ApiResponse<T>>,
        successMessage: string,
        operationName: string
    ): Promise<ApiResponse<T>> {
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
     */
    static createFormData(
        data: Record<string, unknown>,
        file: File | null = null,
        fileFieldName: string = 'file'
    ): FormData {
        const formData = new FormData();

        // 텍스트 데이터 추가
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
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
     */
    static createSafeErrorResponse<T>(
        errorMessage: string,
        defaultData: T = {} as T
    ): ApiResponse<T> {
        return {
            success: false,
            error: errorMessage,
            data: defaultData
        };
    }

    /**
     * 리스트 API용 안전한 응답 반환
     */
    static createSafeListErrorResponse<T>(errorMessage: string): ApiResponse<ListResponse<T>> {
        return this.createSafeErrorResponse(errorMessage, {
            items: [],
            total: 0,
            page: null
        } as ListResponse<T>);
    }

    /**
     * 인증된 GET 요청
     */
    static async get<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
        const queryString = this.buildQueryString(params);
        const url = `${API_CONFIG.BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url);
            return await response.json();
        }

        // fallback to api utility
        const finalUrl = queryString ? `${endpoint}?${queryString}` : endpoint;
        return await api.get<T>(finalUrl);
    }

    /**
     * 인증된 POST 요청
     */
    static async post<T>(endpoint: string, data: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return await response.json();
        }

        // fallback to api utility
        return await api.post<T>(endpoint, data);
    }

    /**
     * 인증된 PUT 요청
     */
    static async put<T>(endpoint: string, data: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            return await response.json();
        }

        // fallback to api utility
        return await api.put<T>(endpoint, data);
    }

    /**
     * 인증된 PATCH 요청
     */
    static async patch<T>(endpoint: string, data: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
            return await response.json();
        }

        // fallback to api utility
        return await api.patch<T>(endpoint, data);
    }

    /**
     * 인증된 DELETE 요청
     */
    static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'DELETE'
            });
            return await response.json();
        }

        // fallback to api utility
        return await api.delete<T>(endpoint);
    }

    /**
     * FormData를 사용한 POST 요청
     */
    static async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;

        if (this.authContext && this.authContext.authenticatedFetch) {
            const response = await this.authContext.authenticatedFetch(url, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        }

        // fallback to api utility
        return await api.post<T>(endpoint, formData);
    }

    /**
     * 안전한 응답 처리 (성공 메시지 포함)
     */
    static safeResponse<T>(
        response: ApiResponse<T>,
        fallbackData: T | null = null,
        successMessage: string | null = null
    ): ApiResponse<T> {
        if (response.success) {
            if (successMessage) {
                showSuccessMessage(successMessage);
            }
            return response;
        } else {
            const errorData = fallbackData !== null ? fallbackData : response.data;
            return {
                success: false,
                error: response.error || '알 수 없는 오류가 발생했습니다.',
                data: errorData
            };
        }
    }

    /**
     * 에러 응답 생성
     */
    static errorResponse<T>(errorMessage: string, data: T = {} as T): ApiResponse<T> {
        return {
            success: false,
            error: errorMessage,
            data
        };
    }
}
