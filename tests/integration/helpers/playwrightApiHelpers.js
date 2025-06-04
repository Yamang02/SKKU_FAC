/**
 * 🎭 Playwright API 통합 테스트 헬퍼 함수들
 */
import { expect } from '@playwright/test';
import dockerTestSetup from './dockerTestSetup.js';

/**
 * 기본 API 테스트 설정
 */
const API_BASE_URL = 'http://localhost:3000';

/**
 * 🧪 Playwright API 테스트 베이스 클래스
 */
class PlaywrightApiHelpers {
    constructor(request = null) {
        this.baseURL = API_BASE_URL;
        this.request = request; // Playwright의 request 객체
        this.authCookies = null;
        this.sessionCookie = null;
    }

    /**
     * 🔧 Playwright request 객체 설정
     */
    setRequest(request) {
        this.request = request;
    }

    /**
     * 📤 기본 GET 요청
     */
    async get(url, options = {}) {
        return await this.request.get(`${this.baseURL}${url}`, {
            ...options,
            failOnStatusCode: false
        });
    }

    /**
     * 📤 기본 POST 요청
     */
    async post(url, data = {}, options = {}) {
        return await this.request.post(`${this.baseURL}${url}`, {
            data,
            ...options,
            failOnStatusCode: false
        });
    }

    /**
     * 📤 기본 PUT 요청
     */
    async put(url, data = {}, options = {}) {
        return await this.request.put(`${this.baseURL}${url}`, {
            data,
            ...options,
            failOnStatusCode: false
        });
    }

    /**
     * 📤 기본 DELETE 요청
     */
    async delete(url, options = {}) {
        return await this.request.delete(`${this.baseURL}${url}`, {
            ...options,
            failOnStatusCode: false
        });
    }

    /**
     * 🔐 사용자 인증 (로그인 후 세션 쿠키 저장)
     */
    async authenticateUser(username, password) {
        const response = await this.post('/user/login', {
            username,
            password
        });

        // 세션 쿠키 저장
        const cookies = response.headers()['set-cookie'];
        if (cookies && Array.isArray(cookies)) {
            this.authCookies = cookies;
            // connect.sid 쿠키 추출
            const sessionMatch = cookies.find(cookie => cookie.includes('connect.sid'));
            if (sessionMatch) {
                this.sessionCookie = sessionMatch.split(';')[0];
            }
        } else if (typeof cookies === 'string') {
            // 단일 쿠키 문자열인 경우
            this.authCookies = [cookies];
            if (cookies.includes('connect.sid')) {
                this.sessionCookie = cookies.split(';')[0];
            }
        }

        return response;
    }

    /**
     * 🔐 테스트 사용자 로그인
     */
    async loginAsTestUser(email = 'test@skku.edu', password = 'testpassword') {
        const response = await this.request.post(`${this.baseURL}/auth/login`, {
            data: { email, password },
            failOnStatusCode: false
        });

        // 세션 쿠키 저장
        const cookies = response.headers()['set-cookie'];
        if (cookies) {
            this.authCookies = cookies;
            // connect.sid 쿠키 추출
            const sessionMatch = cookies.find(cookie => cookie.includes('connect.sid'));
            if (sessionMatch) {
                this.sessionCookie = sessionMatch.split(';')[0];
            }
        }

        return response;
    }

    /**
     * 🧑‍💼 관리자 사용자로 로그인
     */
    async loginAsAdmin(email = 'admin@skku.edu', password = 'adminpassword') {
        const response = await this.request.post(`${this.baseURL}/auth/login`, {
            data: { email, password },
            failOnStatusCode: false
        });

        const cookies = response.headers()['set-cookie'];
        if (cookies) {
            this.authCookies = cookies;
            const sessionMatch = cookies.find(cookie => cookie.includes('connect.sid'));
            if (sessionMatch) {
                this.sessionCookie = sessionMatch.split(';')[0];
            }
        }

        return response;
    }

    /**
     * 📤 로그아웃
     */
    async logout() {
        const headers = {};
        if (this.sessionCookie) {
            headers['Cookie'] = this.sessionCookie;
        }

        const response = await this.request.post(`${this.baseURL}/auth/logout`, {
            headers,
            failOnStatusCode: false
        });

        this.authCookies = null;
        this.sessionCookie = null;
        return response;
    }

    /**
     * 🔒 인증된 GET 요청
     */
    async authenticatedGet(url, options = {}) {
        const headers = { ...options.headers };
        if (this.sessionCookie) {
            headers['Cookie'] = this.sessionCookie;
        }

        return await this.request.get(`${this.baseURL}${url}`, {
            ...options,
            headers,
            failOnStatusCode: false
        });
    }

    /**
     * 🔒 인증된 POST 요청
     */
    async authenticatedPost(url, options = {}) {
        const headers = { ...options.headers };
        if (this.sessionCookie) {
            headers['Cookie'] = this.sessionCookie;
        }

        return await this.request.post(`${this.baseURL}${url}`, {
            ...options,
            headers,
            failOnStatusCode: false
        });
    }

    /**
     * 🔒 인증된 PUT 요청
     */
    async authenticatedPut(url, options = {}) {
        const headers = { ...options.headers };
        if (this.sessionCookie) {
            headers['Cookie'] = this.sessionCookie;
        }

        return await this.request.put(`${this.baseURL}${url}`, {
            ...options,
            headers,
            failOnStatusCode: false
        });
    }

    /**
     * 🔒 인증된 DELETE 요청
     */
    async authenticatedDelete(url, options = {}) {
        const headers = { ...options.headers };
        if (this.sessionCookie) {
            headers['Cookie'] = this.sessionCookie;
        }

        return await this.request.delete(`${this.baseURL}${url}`, {
            ...options,
            headers,
            failOnStatusCode: false
        });
    }

    /**
     * 🏠 헬스체크 테스트
     */
    async checkHealth() {
        const response = await this.request.get(`${this.baseURL}/health`, {
            failOnStatusCode: false
        });
        expect(response.status()).toBe(200);
        return response;
    }

    /**
     * 📊 사용자 생성 헬퍼
     */
    async createTestUser(userData = {}) {
        const defaultUser = {
            name: 'Test User',
            email: 'testuser@skku.edu',
            password: 'testpassword',
            confirmPassword: 'testpassword',
            major: 'Fine Art',
            studentId: '2024000001'
        };

        const userToCreate = { ...defaultUser, ...userData };

        return await this.request.post(`${this.baseURL}/auth/signup`, {
            data: userToCreate,
            failOnStatusCode: false
        });
    }

    /**
     * 🎨 작품 생성 헬퍼
     */
    async createTestArtwork(artworkData = {}) {
        const defaultArtwork = {
            title: 'Test Artwork',
            description: 'Test artwork description',
            medium: 'Oil on Canvas',
            year: new Date().getFullYear(),
            dimensions: '100x80cm'
        };

        const artworkToCreate = { ...defaultArtwork, ...artworkData };

        return await this.authenticatedPost('/api/artworks', {
            data: artworkToCreate
        });
    }

    /**
     * 🖼️ 전시회 생성 헬퍼
     */
    async createTestExhibition(exhibitionData = {}) {
        const defaultExhibition = {
            title: 'Test Exhibition',
            description: 'Test exhibition description',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Test Gallery',
            isActive: true
        };

        const exhibitionToCreate = { ...defaultExhibition, ...exhibitionData };

        return await this.authenticatedPost('/api/exhibitions', {
            data: exhibitionToCreate
        });
    }

    /**
     * 📋 API 응답 검증 헬퍼
     */
    async validateApiResponse(response, expectedStatus = 200) {
        expect(response.status()).toBe(expectedStatus);

        const contentType = response.headers()['content-type'];
        if (contentType?.includes('application/json')) {
            const body = await response.json();
            expect(body).toBeDefined();
            return body;
        }

        return await response.text();
    }

    /**
     * 📊 데이터베이스 상태 확인
     */
    async checkDatabaseConnection() {
        const status = dockerTestSetup.getStatus();
        expect(status.mysqlConnected).toBe(true);
        expect(status.redisConnected).toBe(true);
        return status;
    }

    /**
     * 🧹 테스트 후 정리
     */
    async cleanup() {
        // 로그아웃
        if (this.sessionCookie) {
            await this.logout();
        }

        // 테스트 데이터 정리
        await dockerTestSetup.cleanupTestData();
    }

    /**
     * 📁 파일 업로드 테스트 헬퍼
     */
    async uploadTestFile(endpoint, fieldName = 'image', filePath = null) {
        const defaultTestFile = 'tests/integration/fixtures/test-image.jpg';
        const fileToUpload = filePath || defaultTestFile;

        const headers = {};
        if (this.sessionCookie) {
            headers['Cookie'] = this.sessionCookie;
        }

        return await this.request.post(`${this.baseURL}${endpoint}`, {
            multipart: {
                [fieldName]: {
                    name: 'test-image.jpg',
                    mimeType: 'image/jpeg',
                    buffer: require('fs').readFileSync(fileToUpload)
                }
            },
            headers,
            failOnStatusCode: false
        });
    }

    /**
     * 🔍 페이지네이션 테스트 헬퍼
     */
    async testPagination(endpoint, expectedItemsPerPage = 10) {
        const response = await this.authenticatedGet(`${endpoint}?page=1&limit=${expectedItemsPerPage}`);
        expect(response.status()).toBe(200);

        const body = await this.validateApiResponse(response);
        expect(body.data).toBeDefined();
        expect(body.pagination).toBeDefined();
        expect(body.pagination.page).toBe(1);
        expect(body.pagination.limit).toBe(expectedItemsPerPage);

        return body;
    }

    /**
     * 🔎 검색 기능 테스트 헬퍼
     */
    async testSearch(endpoint, searchTerm) {
        const response = await this.authenticatedGet(`${endpoint}?search=${encodeURIComponent(searchTerm)}`);
        expect(response.status()).toBe(200);
        return response;
    }

    /**
     * ⚠️ 에러 응답 검증 헬퍼
     */
    async validateErrorResponse(response, expectedStatus = 400) {
        expect(response.status()).toBe(expectedStatus);
        const body = await response.json();
        expect(body.error).toBeDefined();
        return body;
    }

    /**
     * 🔐 권한 테스트 헬퍼
     */
    async testUnauthorizedAccess(endpoint, method = 'GET') {
        // 로그아웃 상태에서 접근
        await this.logout();

        const response = await this.request.fetch(`${this.baseURL}${endpoint}`, {
            method: method.toUpperCase(),
            failOnStatusCode: false
        });

        // 인증이 필요한 페이지는 로그인 페이지로 리다이렉트되거나 401 상태 반환
        expect([302, 401, 403]).toContain(response.status());

        return response;
    }
}

export default PlaywrightApiHelpers;
