/**
 * API 관련 타입 정의
 * 모든 API 타입을 여기서 통합 관리
 */

// 기본 API 응답 타입
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
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

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        items: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    error?: string;
    message?: string;
}

// 기본 필터 파라미터 타입
export interface BaseFilterParams extends PaginationParams {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
