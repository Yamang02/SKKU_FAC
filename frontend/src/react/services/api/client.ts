// React Native Web용 API 클라이언트
export interface ApiClientResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
}

export interface ApiClientConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}

// CSRF 토큰 관리자
class CSRFManager {
    private token: string | null = null;

    async getToken(): Promise<string | null> {
        if (!this.token) {
            await this.refreshToken();
        }
        return this.token;
    }

    async refreshToken(): Promise<void> {
        try {
            const response = await fetch('/api/csrf-token', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
            }
        } catch (error) {
            console.error('CSRF 토큰 갱신 실패:', error);
        }
    }

    async addToHeaders(headers: Record<string, string> = {}): Promise<Record<string, string>> {
        const token = await this.getToken();
        if (token) {
            return {
                ...headers,
                'X-CSRF-Token': token,
            };
        }
        return headers;
    }

    async addToData(data: any): Promise<any> {
        const token = await this.getToken();
        if (token) {
            return {
                ...data,
                _csrf: token,
            };
        }
        return data;
    }

    async addToFormData(formData: FormData): Promise<void> {
        const token = await this.getToken();
        if (token) {
            formData.append('_csrf', token);
        }
    }
}

class ApiClient {
    private baseURL: string;
    private timeout: number;
    private defaultHeaders: Record<string, string>;
    private csrfManager: CSRFManager;

    constructor(config: ApiClientConfig = {}) {
        this.baseURL = config.baseURL || '';
        this.timeout = config.timeout || 10000;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...config.headers,
        };
        this.csrfManager = new CSRFManager();
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const contentType = response.headers.get('content-type');

        // HTML 응답 확인 (서버 오류 페이지인 경우)
        if (contentType && contentType.includes('text/html')) {
            console.error('서버에서 HTML 응답을 반환했습니다. 서버 오류가 발생했을 수 있습니다.');
            throw new Error('서버 오류가 발생했습니다. 관리자에게 문의하세요.');
        }

        try {
            const data = await response.json();

            // ApiResponse에서 성공 여부 확인
            if (!data.success) {
                const errorMessage = data.error || '요청 처리 중 오류가 발생했습니다.';
                const error = new Error(errorMessage) as any;
                error.isApiError = true;
                error.statusCode = response.status;
                error.apiResponse = data;
                throw error;
            }

            return data;
        } catch (error: any) {
            if (error.isApiError) {
                throw error;
            } else if (error instanceof SyntaxError) {
                console.error('JSON 파싱 오류:', error);
                throw new Error('서버 응답을 처리할 수 없습니다. 관리자에게 문의하세요.');
            } else {
                console.error('응답 처리 중 오류:', error);
                throw error;
            }
        }
    }

    private async request<T>(
        method: string,
        url: string,
        data?: any,
        headers?: Record<string, string>
    ): Promise<ApiResponse<T>> {
        const fullUrl = `${this.baseURL}${url}`;
        const isFormData = data instanceof FormData;

        let requestHeaders = { ...this.defaultHeaders, ...headers };
        let requestBody: string | FormData | undefined;

        // CSRF 토큰 처리
        if (method !== 'GET') {
            if (isFormData) {
                await this.csrfManager.addToFormData(data);
                requestHeaders = await this.csrfManager.addToHeaders({
                    ...headers, // FormData의 경우 Content-Type 제거
                });
                delete requestHeaders['Content-Type']; // 브라우저가 자동 설정
                requestBody = data;
            } else if (data) {
                const dataWithCSRF = await this.csrfManager.addToData(data);
                requestHeaders = await this.csrfManager.addToHeaders(requestHeaders);
                requestBody = JSON.stringify(dataWithCSRF);
            } else {
                requestHeaders = await this.csrfManager.addToHeaders(requestHeaders);
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(fullUrl, {
                method,
                headers: requestHeaders,
                body: requestBody,
                signal: controller.signal,
                credentials: 'include', // 세션 쿠키 포함
            });

            clearTimeout(timeoutId);

            // CSRF 토큰 오류인 경우 토큰 갱신 후 재시도
            if (response.status === 403) {
                const responseData = await response.clone().json().catch(() => ({}));
                if (responseData.code === 'CSRF_TOKEN_MISSING' || responseData.code === 'CSRF_TOKEN_INVALID') {
                    console.log('CSRF 토큰 오류, 토큰 갱신 후 재시도...');

                    // 토큰 갱신
                    await this.csrfManager.refreshToken();

                    // 요청 재구성
                    let retryHeaders = { ...this.defaultHeaders, ...headers };
                    let retryBody: string | FormData | undefined;

                    if (isFormData) {
                        // FormData는 새로 생성
                        const newFormData = new FormData();
                        for (const [key, value] of data.entries()) {
                            if (key !== '_csrf') {
                                newFormData.append(key, value);
                            }
                        }
                        await this.csrfManager.addToFormData(newFormData);
                        retryHeaders = await this.csrfManager.addToHeaders({ ...headers });
                        delete retryHeaders['Content-Type'];
                        retryBody = newFormData;
                    } else if (data) {
                        const retryDataWithCSRF = await this.csrfManager.addToData(data);
                        retryHeaders = await this.csrfManager.addToHeaders(retryHeaders);
                        retryBody = JSON.stringify(retryDataWithCSRF);
                    } else {
                        retryHeaders = await this.csrfManager.addToHeaders(retryHeaders);
                    }

                    // 재시도
                    const retryResponse = await fetch(fullUrl, {
                        method,
                        headers: retryHeaders,
                        body: retryBody,
                        credentials: 'include',
                    });

                    return this.handleResponse<T>(retryResponse);
                }
            }

            return this.handleResponse<T>(response);
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async get<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>('GET', url, undefined, headers);
    }

    async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>('POST', url, data, headers);
    }

    async put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', url, data, headers);
    }

    async delete<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', url, undefined, headers);
    }

    async patch<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>('PATCH', url, data, headers);
    }
}

// 기본 API 클라이언트 인스턴스
export const apiClient = new ApiClient({
    baseURL: process.env.REACT_APP_API_BASE_URL || '',
    timeout: 10000,
});

export default ApiClient;
