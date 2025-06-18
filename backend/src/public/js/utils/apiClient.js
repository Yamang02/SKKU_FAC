/**
 * 프론트엔드 프레임워크 분리 대비 API 클라이언트
 * JWT 토큰 기반 인증과 CSRF 토큰을 모두 지원
 */
class ApiClient {
    constructor() {
        this.baseURL = '';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
        this.tokenKey = 'auth_token'; // JWT 토큰 저장 키
    }

    /**
     * JWT 토큰 설정
     */
    setAuthToken(token) {
        if (token) {
            localStorage.setItem(this.tokenKey, token);
        } else {
            localStorage.removeItem(this.tokenKey);
        }
    }

    /**
     * JWT 토큰 가져오기
     */
    getAuthToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * CSRF 토큰 가져오기 (메타 태그에서)
     */
    getCSRFToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : null;
    }

    /**
     * 요청 헤더 구성
     */
    async buildHeaders(customHeaders = {}) {
        const headers = { ...this.defaultHeaders, ...customHeaders };

        // JWT 토큰이 있으면 Authorization 헤더 추가
        const authToken = this.getAuthToken();
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        } else {
            // JWT 토큰이 없으면 CSRF 토큰 사용 (현재 방식)
            const csrfToken = this.getCSRFToken();
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }
        }

        return headers;
    }

    /**
     * 요청 본문에 CSRF 토큰 추가 (JWT 없을 때)
     */
    addCSRFToData(data) {
        const authToken = this.getAuthToken();
        if (!authToken) {
            const csrfToken = this.getCSRFToken();
            if (csrfToken) {
                return { ...data, _csrf: csrfToken };
            }
        }
        return data;
    }

    /**
     * FormData에 CSRF 토큰 추가 (JWT 없을 때)
     */
    addCSRFToFormData(formData) {
        const authToken = this.getAuthToken();
        if (!authToken) {
            const csrfToken = this.getCSRFToken();
            if (csrfToken) {
                formData.append('_csrf', csrfToken);
            }
        }
        return formData;
    }

    /**
     * 응답 처리
     */
    async handleResponse(response) {
        // 401 Unauthorized - JWT 토큰 만료 또는 무효
        if (response.status === 401) {
            this.setAuthToken(null); // 토큰 제거

            // 프론트엔드 프레임워크 환경에서는 로그인 페이지로 리다이렉트
            if (window.location.pathname.startsWith('/api/')) {
                // API 요청이면 에러 반환
                throw new Error('Authentication required');
            } else {
                // 일반 페이지면 로그인으로 리다이렉트
                window.location.href = '/user/login';
                return;
            }
        }

        // 403 Forbidden - CSRF 토큰 문제일 수 있음
        if (response.status === 403) {
            const responseData = await response.clone().json().catch(() => ({}));
            if (responseData.code === 'CSRF_TOKEN_MISSING' || responseData.code === 'CSRF_TOKEN_INVALID') {
                // CSRF 토큰 갱신 시도
                await this.refreshCSRFToken();
                throw new Error('CSRF_TOKEN_REFRESH_NEEDED');
            }
        }

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.error || `HTTP ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response;
    }

    /**
     * CSRF 토큰 갱신
     */
    async refreshCSRFToken() {
        try {
            const response = await fetch('/csrf-token', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.csrfToken) {
                    // 메타 태그 업데이트
                    const metaTag = document.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', data.csrfToken);
                    }
                    return data.csrfToken;
                }
            }
        } catch (error) {
            console.error('CSRF 토큰 갱신 실패:', error);
        }
        return null;
    }

    /**
     * GET 요청
     */
    async get(url, options = {}) {
        const headers = await this.buildHeaders(options.headers);

        const response = await fetch(this.baseURL + url, {
            method: 'GET',
            headers,
            credentials: 'include',
            ...options
        });

        return this.handleResponse(response);
    }

    /**
     * POST 요청
     */
    async post(url, data, options = {}) {
        const isFormData = data instanceof FormData;
        let body;
        let headers;

        if (isFormData) {
            body = this.addCSRFToFormData(data);
            headers = await this.buildHeaders({
                ...options.headers,
                // FormData일 때는 Content-Type 제거 (브라우저가 자동 설정)
                'Content-Type': undefined
            });
            delete headers['Content-Type'];
        } else {
            body = JSON.stringify(this.addCSRFToData(data));
            headers = await this.buildHeaders(options.headers);
        }

        let response = await fetch(this.baseURL + url, {
            method: 'POST',
            headers,
            body,
            credentials: 'include',
            ...options
        });

        // CSRF 토큰 갱신 후 재시도
        if (response.status === 403) {
            const responseData = await response.clone().json().catch(() => ({}));
            if (responseData.code === 'CSRF_TOKEN_MISSING' || responseData.code === 'CSRF_TOKEN_INVALID') {
                await this.refreshCSRFToken();

                // 요청 재구성
                if (isFormData) {
                    // FormData 재생성 (CSRF 토큰이 이미 추가되어 있을 수 있음)
                    const newFormData = new FormData();
                    for (const [key, value] of data.entries()) {
                        if (key !== '_csrf') {
                            newFormData.append(key, value);
                        }
                    }
                    body = this.addCSRFToFormData(newFormData);
                } else {
                    body = JSON.stringify(this.addCSRFToData(data));
                }
                headers = await this.buildHeaders(options.headers);
                if (isFormData) {
                    delete headers['Content-Type'];
                }

                response = await fetch(this.baseURL + url, {
                    method: 'POST',
                    headers,
                    body,
                    credentials: 'include',
                    ...options
                });
            }
        }

        return this.handleResponse(response);
    }

    /**
     * PUT 요청
     */
    async put(url, data, options = {}) {
        const body = JSON.stringify(this.addCSRFToData(data));
        let headers = await this.buildHeaders(options.headers);

        let response = await fetch(this.baseURL + url, {
            method: 'PUT',
            headers,
            body,
            credentials: 'include',
            ...options
        });

        // CSRF 토큰 갱신 후 재시도
        if (response.status === 403) {
            const responseData = await response.clone().json().catch(() => ({}));
            if (responseData.code === 'CSRF_TOKEN_MISSING' || responseData.code === 'CSRF_TOKEN_INVALID') {
                await this.refreshCSRFToken();
                headers = await this.buildHeaders(options.headers);

                response = await fetch(this.baseURL + url, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(this.addCSRFToData(data)),
                    credentials: 'include',
                    ...options
                });
            }
        }

        return this.handleResponse(response);
    }

    /**
     * DELETE 요청
     */
    async delete(url, options = {}) {
        let headers = await this.buildHeaders(options.headers);

        let response = await fetch(this.baseURL + url, {
            method: 'DELETE',
            headers,
            credentials: 'include',
            ...options
        });

        // CSRF 토큰 갱신 후 재시도
        if (response.status === 403) {
            const responseData = await response.clone().json().catch(() => ({}));
            if (responseData.code === 'CSRF_TOKEN_MISSING' || responseData.code === 'CSRF_TOKEN_INVALID') {
                await this.refreshCSRFToken();
                headers = await this.buildHeaders(options.headers);

                response = await fetch(this.baseURL + url, {
                    method: 'DELETE',
                    headers,
                    credentials: 'include',
                    ...options
                });
            }
        }

        return this.handleResponse(response);
    }

    /**
     * 로그인 (JWT 토큰 받기)
     */
    async login(credentials) {
        const response = await this.post('/api/auth/login', credentials);

        if (response.token) {
            this.setAuthToken(response.token);
        }

        return response;
    }

    /**
     * 로그아웃
     */
    async logout() {
        try {
            await this.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            this.setAuthToken(null);
        }
    }
}

// 전역 인스턴스 생성
const apiClient = new ApiClient();

// 기존 api 객체와 호환성 유지
const api = {
    get: (url, options) => apiClient.get(url, options),
    post: (url, data, options) => apiClient.post(url, data, options),
    put: (url, data, options) => apiClient.put(url, data, options),
    delete: (url, options) => apiClient.delete(url, options),

    // 추가 메소드
    setAuthToken: (token) => apiClient.setAuthToken(token),
    getAuthToken: () => apiClient.getAuthToken(),
    login: (credentials) => apiClient.login(credentials),
    logout: () => apiClient.logout()
};

// 전역 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiClient, api };
} else {
    window.apiClient = apiClient;
    window.api = api;
}
