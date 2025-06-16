export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    status: number;
    code?: string;
    details?: any;
}

export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

export interface FormState<T> extends LoadingState {
    data: T;
    isDirty: boolean;
    isValid: boolean;
    errors: Record<string, string>;
}

export interface UploadResponse {
    url: string;
    publicId: string;
    filename: string;
    size: number;
}

export interface ImageUploadOptions {
    maxSize?: number;
    allowedTypes?: string[];
    quality?: number;
    width?: number;
    height?: number;
}
