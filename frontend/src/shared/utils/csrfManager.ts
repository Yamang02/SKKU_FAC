/**
 * CSRF 토큰 관리자 - TypeScript 버전
 * React Native Web에서 이관된 CSRF 보안 관리
 */

import { API_ENDPOINTS } from '../config/api.config';

interface CSRFTokenResponse {
    success: boolean;
    token?: string;
    error?: string;
}

class CSRFManager {
    private token: string | null = null;
    private tokenPromise: Promise<string> | null = null;

    /**
     * CSRF 토큰 가져오기 (캐시된 토큰 또는 새로 요청)
     */
    async getToken(): Promise<string> {
        if (this.token) {
            return this.token;
        }

        // 이미 토큰을 요청 중인 경우 해당 Promise 반환
        if (this.tokenPromise) {
            return this.tokenPromise;
        }

        this.tokenPromise = this.fetchToken();
        try {
            this.token = await this.tokenPromise;
            return this.token;
        } finally {
            this.tokenPromise = null;
        }
    }

    /**
     * 서버에서 새로운 CSRF 토큰 요청
     */
    private async fetchToken(): Promise<string> {
        try {
            const response = await fetch(API_ENDPOINTS.CSRF, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`CSRF 토큰 요청 실패: ${response.status}`);
            }

            const data: CSRFTokenResponse = await response.json();

            if (!data.success || !data.token) {
                throw new Error('CSRF 토큰을 받을 수 없습니다.');
            }

            console.log('새로운 CSRF 토큰을 받았습니다.');
            return data.token;
        } catch (error) {
            console.error('CSRF 토큰 요청 중 오류:', error);
            throw error;
        }
    }

    /**
     * 토큰 강제 갱신
     */
    async refreshToken(): Promise<string> {
        this.token = null;
        this.tokenPromise = null;
        return this.getToken();
    }

    /**
     * JSON 데이터에 CSRF 토큰 추가
     */
    async addToData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
        const token = await this.getToken();
        return {
            ...data,
            _csrf: token
        };
    }

    /**
     * 헤더에 CSRF 토큰 추가
     */
    async addToHeaders(headers: Record<string, string> = {}): Promise<Record<string, string>> {
        const token = await this.getToken();
        return {
            ...headers,
            'X-CSRF-Token': token
        };
    }

    /**
     * FormData에 CSRF 토큰 추가
     */
    async addToFormData(formData: FormData): Promise<void> {
        const token = await this.getToken();
        formData.append('_csrf', token);
    }

    /**
     * 토큰 캐시 초기화
     */
    clearToken(): void {
        this.token = null;
        this.tokenPromise = null;
    }

    /**
     * 현재 토큰 상태 확인 (디버깅용)
     */
    getTokenStatus(): { hasToken: boolean; isRequesting: boolean } {
        return {
            hasToken: this.token !== null,
            isRequesting: this.tokenPromise !== null
        };
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const csrfManager = new CSRFManager();
export default csrfManager;
