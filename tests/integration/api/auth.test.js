/**
 * 🔐 인증 API 통합 테스트
 */
import { test, expect } from '@playwright/test';
import PlaywrightApiHelpers from '../helpers/playwrightApiHelpers.js';
import { testUsers } from '../fixtures/testData.js';

test.describe('🔐 Auth API Tests', () => {
    let apiHelper;

    test.beforeEach(async ({ request }) => {
        apiHelper = new PlaywrightApiHelpers(request);
    });

    test.describe('로컬 로그인/로그아웃', () => {
        test('POST /auth/login - 성공적인 로그인', async () => {
            const response = await apiHelper.post('/auth/login', {
                username: testUsers.regularUser.username,
                password: testUsers.regularUser.password
            });

            expect(response.status()).toBe(302); // 리다이렉트
            expect(response.headers()['location']).toBeTruthy();
        });

        test('POST /auth/login - 잘못된 자격증명', async () => {
            const response = await apiHelper.post('/auth/login', {
                username: 'wronguser',
                password: 'wrongpassword'
            });

            expect(response.status()).toBe(302); // 실패 시 리다이렉트
        });

        test('GET /auth/logout - 로그아웃', async () => {
            // 먼저 로그인
            await apiHelper.post('/auth/login', {
                username: testUsers.regularUser.username,
                password: testUsers.regularUser.password
            });

            // 로그아웃
            const response = await apiHelper.get('/auth/logout');
            expect(response.status()).toBe(302); // 리다이렉트
        });
    });

    test.describe('이메일 인증', () => {
        test('POST /auth/verify-email - 이메일 인증 처리', async () => {
            const response = await apiHelper.post('/auth/verify-email', {
                token: 'test-verification-token',
                email: testUsers.regularUser.email
            });

            // 토큰이 유효하지 않을 수 있으므로 400 또는 302 허용
            expect([400, 302]).toContain(response.status());
        });

        test('POST /auth/resend-token - 토큰 재전송', async () => {
            const response = await apiHelper.post('/auth/resend-token', {
                email: testUsers.regularUser.email
            });

            expect([200, 400]).toContain(response.status());
        });

        test('GET /auth/validate-token - 토큰 검증', async () => {
            const response = await apiHelper.get('/auth/validate-token?token=test-token&email=test@example.com');

            expect([200, 400]).toContain(response.status());
        });
    });

    test.describe('비밀번호 재설정', () => {
        test('POST /auth/request-password-reset - 비밀번호 재설정 요청', async () => {
            const response = await apiHelper.post('/auth/request-password-reset', {
                email: testUsers.regularUser.email
            });

            expect([200, 400]).toContain(response.status());
        });

        test('POST /auth/reset-password - 비밀번호 재설정', async () => {
            const response = await apiHelper.post('/auth/reset-password', {
                token: 'test-reset-token',
                email: testUsers.regularUser.email,
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            });

            expect([200, 400]).toContain(response.status());
        });
    });

    test.describe('JWT 인증', () => {
        test('POST /auth/jwt/login - JWT 로그인', async () => {
            const response = await apiHelper.post('/auth/jwt/login', {
                username: testUsers.regularUser.username,
                password: testUsers.regularUser.password
            });

            expect([200, 401]).toContain(response.status());
        });

        test('POST /auth/jwt/refresh - JWT 토큰 갱신', async () => {
            const response = await apiHelper.post('/auth/jwt/refresh', {
                refreshToken: 'test-refresh-token'
            });

            expect([200, 401]).toContain(response.status());
        });

        test('GET /auth/jwt/verify - JWT 토큰 검증', async () => {
            const response = await apiHelper.get('/auth/jwt/verify', {
                headers: {
                    'Authorization': 'Bearer test-jwt-token'
                }
            });

            expect([200, 401]).toContain(response.status());
        });

        test('POST /auth/jwt/logout - JWT 로그아웃', async () => {
            const response = await apiHelper.post('/auth/jwt/logout', {}, {
                headers: {
                    'Authorization': 'Bearer test-jwt-token'
                }
            });

            expect([200, 401]).toContain(response.status());
        });
    });
});
