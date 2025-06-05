/**
 * CSRF 토큰 관리 유틸리티
 */
class CSRFManager {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.refreshPromise = null;
    }

    /**
     * 메타 태그에서 CSRF 토큰 가져오기
     */
    getTokenFromMeta() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : null;
    }

    /**
     * 서버에서 CSRF 토큰 가져오기
     */
    async fetchTokenFromServer() {
        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`CSRF 토큰 가져오기 실패: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.csrfToken) {
                this.token = data.csrfToken;
                this.tokenExpiry = Date.now() + (30 * 60 * 1000); // 30분 후 만료
                return this.token;
            } else {
                throw new Error('유효하지 않은 CSRF 토큰 응답');
            }
        } catch (error) {
            console.error('CSRF 토큰 가져오기 실패:', error);
            throw error;
        }
    }

    /**
     * 현재 CSRF 토큰 가져오기 (캐시된 토큰 또는 새로 가져오기)
     */
    async getToken() {
        // 메타 태그에서 먼저 시도
        const metaToken = this.getTokenFromMeta();
        if (metaToken) {
            this.token = metaToken;
            return metaToken;
        }

        // 캐시된 토큰이 있고 만료되지 않았으면 사용
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        // 이미 토큰을 가져오는 중이면 기다리기
        if (this.refreshPromise) {
            return await this.refreshPromise;
        }

        // 새로운 토큰 가져오기
        this.refreshPromise = this.fetchTokenFromServer();
        try {
            const token = await this.refreshPromise;
            return token;
        } finally {
            this.refreshPromise = null;
        }
    }

    /**
     * 토큰을 무효화하고 새로 가져오기
     */
    async refreshToken() {
        this.token = null;
        this.tokenExpiry = null;
        return await this.getToken();
    }

    /**
     * FormData에 CSRF 토큰 추가
     */
    async addToFormData(formData) {
        const token = await this.getToken();
        if (token) {
            formData.append('_csrf', token);
        }
        return formData;
    }

    /**
     * 요청 헤더에 CSRF 토큰 추가
     */
    async addToHeaders(headers = {}) {
        const token = await this.getToken();
        if (token) {
            headers['X-CSRF-Token'] = token;
        }
        return headers;
    }

    /**
     * JSON 데이터에 CSRF 토큰 추가
     */
    async addToData(data = {}) {
        const token = await this.getToken();
        if (token) {
            data._csrf = token;
        }
        return data;
    }
}

// 전역 인스턴스 생성
const csrfManager = new CSRFManager();

export default csrfManager;
