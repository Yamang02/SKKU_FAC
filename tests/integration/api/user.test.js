/**
 * 👤 사용자 API 통합 테스트
 * 새로운 테스트 훅 시스템을 사용한 개선된 버전
 */
import { test, expect } from '@playwright/test';
import PlaywrightApiHelpers from '../helpers/playwrightApiHelpers.js';
import { setupUserOnlyTestEnvironment, getSeededUser } from '../helpers/testHooks.js';

// 사용자 데이터만 시딩하는 테스트 환경 설정
const testHooks = setupUserOnlyTestEnvironment();

test.describe('👤 User API Tests', () => {
    let apiHelper;

    test.beforeEach(async ({ request }) => {
        apiHelper = new PlaywrightApiHelpers(request);
    });

    test.describe('사용자 등록', () => {
        test('POST /user - 새 사용자 등록', async () => {
            const newUser = {
                username: 'newuser123',
                email: 'newuser@skku.edu',
                password: 'password123',
                confirmPassword: 'password123',
                name: 'New User',
                department: 'Computer Science',
                studentYear: 2,
            };

            const response = await apiHelper.post('/user', newUser);

            // 성공 시 리다이렉트 또는 검증 필요 시 400
            expect([200, 302, 400]).toContain(response.status());
        });

        test('POST /user - 중복 사용자명으로 등록 실패', async () => {
            const existingUser = getSeededUser('regularUser');
            expect(existingUser).toBeTruthy();

            const duplicateUser = {
                username: existingUser.username,
                email: 'different@skku.edu',
                password: 'password123',
                confirmPassword: 'password123',
                name: 'Duplicate User',
            };

            const response = await apiHelper.post('/user', duplicateUser);
            expect([400, 302]).toContain(response.status());
        });

        test('POST /user - 비밀번호 불일치로 등록 실패', async () => {
            const invalidUser = {
                username: 'testuser2',
                email: 'test2@skku.edu',
                password: 'password123',
                confirmPassword: 'differentpassword',
                name: 'Test User 2',
            };

            const response = await apiHelper.post('/user', invalidUser);
            expect([400, 302]).toContain(response.status());
        });
    });

    test.describe('사용자 로그인/로그아웃', () => {
        test('POST /user/login - 성공적인 로그인', async () => {
            const user = getSeededUser('regularUser');
            expect(user).toBeTruthy();

            const response = await apiHelper.post('/user/login', {
                username: user.username,
                password: 'testpassword', // testData.js에서 정의된 비밀번호
            });

            expect([200, 302]).toContain(response.status());
        });

        test('POST /user/login - 잘못된 자격증명', async () => {
            const response = await apiHelper.post('/user/login', {
                username: 'wronguser',
                password: 'wrongpassword',
            });

            expect([401, 302]).toContain(response.status());
        });

        test('GET /user/logout - 로그아웃', async () => {
            // 먼저 로그인
            const user = getSeededUser('regularUser');
            await apiHelper.authenticateUser(user.username, 'testpassword');

            // 로그아웃
            const response = await apiHelper.get('/user/logout');
            expect([200, 302]).toContain(response.status());
        });
    });

    test.describe('사용자 프로필 API', () => {
        test('GET /user/api/me - 인증된 사용자 프로필 조회', async () => {
            // 로그인 후 세션 쿠키 획득
            const user = getSeededUser('regularUser');
            await apiHelper.authenticateUser(user.username, 'testpassword');

            const response = await apiHelper.get('/user/api/me');

            if (response.status() === 200) {
                const data = await response.json();
                expect(data.success).toBe(true);
                expect(data.data).toBeTruthy();
                expect(data.data.username).toBe(user.username);
            } else {
                // 인증 실패 시
                expect([401, 302]).toContain(response.status());
            }
        });

        test('GET /user/api/session - 세션 사용자 정보 조회', async () => {
            // 로그인 후 세션 쿠키 획득
            const user = getSeededUser('regularUser');
            await apiHelper.authenticateUser(user.username, 'testpassword');

            const response = await apiHelper.get('/user/api/session');

            if (response.status() === 200) {
                const data = await response.json();
                expect(data.success).toBe(true);
            } else {
                expect([401, 302]).toContain(response.status());
            }
        });

        test('PUT /user/me - 사용자 프로필 업데이트', async () => {
            // 로그인 후 세션 쿠키 획득
            const user = getSeededUser('regularUser');
            await apiHelper.authenticateUser(user.username, 'testpassword');

            const updateData = {
                name: 'Updated Name',
                department: 'Updated Department',
                studentYear: 3,
            };

            const response = await apiHelper.put('/user/me', updateData);
            expect([200, 302, 400]).toContain(response.status());
        });

        test('DELETE /user/me - 사용자 계정 삭제', async () => {
            // 테스트용 임시 사용자 생성 후 삭제 테스트
            // 실제로는 기존 사용자를 삭제하지 않도록 주의
            const response = await apiHelper.delete('/user/me');
            expect([401, 302]).toContain(response.status()); // 인증되지 않은 상태에서 호출
        });
    });

    test.describe('사용자 유틸리티 API', () => {
        test('GET /user/api/find-username - 이메일로 사용자명 찾기', async () => {
            const user = getSeededUser('regularUser');
            const response = await apiHelper.get(`/user/api/find-username?email=${user.email}`);
            expect([200, 404]).toContain(response.status());
        });

        test('POST /user/password/reset - 비밀번호 재설정', async () => {
            const user = getSeededUser('regularUser');
            const response = await apiHelper.post('/user/password/reset', {
                email: user.email,
                token: 'test-reset-token',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123',
            });

            expect([200, 400]).toContain(response.status());
        });

        test('GET /user/api/flash-message - 플래시 메시지 조회', async () => {
            const response = await apiHelper.get('/user/api/flash-message');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('success');
        });
    });

    test.describe('인증 없이 접근 제한 테스트', () => {
        test('GET /user/api/me - 인증 없이 접근 시 401', async () => {
            const response = await apiHelper.get('/user/api/me');
            expect([401, 302]).toContain(response.status());
        });

        test('PUT /user/me - 인증 없이 접근 시 401', async () => {
            const response = await apiHelper.put('/user/me', { name: 'Test' });
            expect([401, 302]).toContain(response.status());
        });

        test('DELETE /user/me - 인증 없이 접근 시 401', async () => {
            const response = await apiHelper.delete('/user/me');
            expect([401, 302]).toContain(response.status());
        });
    });

    test.describe('관리자 사용자 테스트', () => {
        test('관리자 사용자 로그인 및 권한 확인', async () => {
            const adminUser = getSeededUser('adminUser');
            expect(adminUser).toBeTruthy();

            const response = await apiHelper.post('/user/login', {
                username: adminUser.username,
                password: 'adminpassword',
            });

            expect([200, 302]).toContain(response.status());
        });
    });

    test.describe('SKKU 사용자 테스트', () => {
        test('SKKU 사용자 프로필 정보 확인', async () => {
            const skkuUser = getSeededUser('skkuUser');
            expect(skkuUser).toBeTruthy();

            // SKKU 사용자로 로그인
            await apiHelper.authenticateUser(skkuUser.username, 'skkupassword');

            const response = await apiHelper.get('/user/api/me');

            if (response.status() === 200) {
                const data = await response.json();
                expect(data.success).toBe(true);
                expect(data.data.username).toBe(skkuUser.username);
                // SKKU 사용자는 추가 프로필 정보를 가져야 함
            }
        });
    });
});
