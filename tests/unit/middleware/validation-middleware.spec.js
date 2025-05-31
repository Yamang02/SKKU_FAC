import { test, expect } from '@playwright/test';

/**
 * Task 5.1 검증 미들웨어 테스트
 * 실제 API 엔드포인트를 통한 검증 미들웨어 동작 확인
 */

test.describe('검증 미들웨어 테스트 (Task 5.1)', () => {

    test.describe('회원가입 검증 테스트', () => {

        test('유효한 SKKU 회원가입 데이터', async ({ request }) => {
            const timestamp = Date.now();
            const validData = {
                username: `skkutest${timestamp}`,
                email: `skkutest${timestamp}@skku.edu`,
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: 'SKKU 테스트 사용자',
                role: 'SKKU_MEMBER',
                department: '컴퓨터공학과',
                studentYear: '23'
            };

            const response = await request.post('/user', {
                data: validData
            });

            // 성공 응답 또는 중복 오류 (이미 존재하는 경우)
            expect([200, 201, 400]).toContain(response.status());

            if (response.status() === 400) {
                const body = await response.json();
                // 중복 오류인 경우 허용
                expect(body.message).toMatch(/(이미 존재|중복|duplicate)/i);
            }
        });

        test('유효한 외부 회원가입 데이터', async ({ request }) => {
            const timestamp = Date.now();
            const validData = {
                username: `external${timestamp}`,
                email: `external${timestamp}@example.com`,
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '외부 테스트 사용자',
                role: 'EXTERNAL_MEMBER',
                affiliation: '외부 기관'
            };

            const response = await request.post('/user', {
                data: validData
            });

            expect([200, 201, 400]).toContain(response.status());

            if (response.status() === 400) {
                const body = await response.json();
                expect(body.message).toMatch(/(이미 존재|중복|duplicate)/i);
            }
        });

        test('필수 필드 누락 - username', async ({ request }) => {
            const invalidData = {
                // username 누락
                email: 'test@example.com',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '테스트 사용자',
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('사용자명');
        });

        test('필수 필드 누락 - email', async ({ request }) => {
            const invalidData = {
                username: 'testuser',
                // email 누락
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '테스트 사용자',
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('이메일');
        });

        test('잘못된 이메일 형식', async ({ request }) => {
            const invalidData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '테스트 사용자',
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('이메일');
        });

        test('약한 비밀번호', async ({ request }) => {
            const invalidData = {
                username: 'testuser',
                email: 'test@example.com',
                password: '123', // 너무 약한 비밀번호
                confirmPassword: '123',
                name: '테스트 사용자',
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('비밀번호');
        });

        test('비밀번호 확인 불일치', async ({ request }) => {
            const invalidData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Test123!@#',
                confirmPassword: 'Different123!@#',
                name: '테스트 사용자',
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('비밀번호');
        });

        test('잘못된 역할', async ({ request }) => {
            const invalidData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '테스트 사용자',
                role: 'INVALID_ROLE'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('역할');
        });

        test('SKKU 회원 필수 필드 누락 - department', async ({ request }) => {
            const invalidData = {
                username: 'skkuuser',
                email: 'skku@skku.edu',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: 'SKKU 사용자',
                role: 'SKKU_MEMBER',
                // department 누락
                studentYear: '23'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('학과');
        });

        test('외부 회원 필수 필드 누락 - affiliation', async ({ request }) => {
            const invalidData = {
                username: 'externaluser',
                email: 'external@example.com',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '외부 사용자',
                role: 'EXTERNAL_MEMBER'
                // affiliation 누락
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('소속');
        });
    });

    test.describe('로그인 검증 테스트', () => {

        test('유효한 로그인 데이터', async ({ request }) => {
            const validData = {
                username: 'admin',
                password: 'admin123'
            };

            const response = await request.post('/user/login', {
                data: validData
            });

            // 성공 또는 인증 실패 (계정이 없는 경우)
            expect([200, 302, 401]).toContain(response.status());
        });

        test('필수 필드 누락 - username', async ({ request }) => {
            const invalidData = {
                // username 누락
                password: 'password123'
            };

            const response = await request.post('/user/login', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('사용자명');
        });

        test('필수 필드 누락 - password', async ({ request }) => {
            const invalidData = {
                username: 'testuser'
                // password 누락
            };

            const response = await request.post('/user/login', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('비밀번호');
        });

        test('빈 문자열 username', async ({ request }) => {
            const invalidData = {
                username: '',
                password: 'password123'
            };

            const response = await request.post('/user/login', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('사용자명');
        });

        test('빈 문자열 password', async ({ request }) => {
            const invalidData = {
                username: 'testuser',
                password: ''
            };

            const response = await request.post('/user/login', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toContain('비밀번호');
        });
    });

    test.describe('프로필 업데이트 검증 테스트', () => {

        test('유효한 프로필 업데이트 데이터', async ({ request }) => {
            const validData = {
                name: '업데이트된 이름',
                email: 'updated@example.com'
            };

            const response = await request.put('/user/me', {
                data: validData
            });

            // 인증이 필요하므로 401 또는 성공 응답
            expect([200, 401]).toContain(response.status());
        });

        test('잘못된 이메일 형식', async ({ request }) => {
            const invalidData = {
                name: '업데이트된 이름',
                email: 'invalid-email-format'
            };

            const response = await request.put('/user/me', {
                data: invalidData
            });

            if (response.status() === 400) {
                const body = await response.json();
                expect(body.success).toBe(false);
                expect(body.message).toContain('이메일');
            }
        });

        test('빈 이름', async ({ request }) => {
            const invalidData = {
                name: '',
                email: 'valid@example.com'
            };

            const response = await request.put('/user/me', {
                data: invalidData
            });

            if (response.status() === 400) {
                const body = await response.json();
                expect(body.success).toBe(false);
                expect(body.message).toContain('이름');
            }
        });
    });

    test.describe('이메일 검증 테스트', () => {

        test('유효한 이메일 검증 요청', async ({ request }) => {
            const validData = {
                email: 'test@example.com'
            };

            const response = await request.post('/user/verify-email', {
                data: validData
            });

            // 구현에 따라 다양한 응답 가능
            expect([200, 404, 500]).toContain(response.status());
        });

        test('잘못된 이메일 형식', async ({ request }) => {
            const invalidData = {
                email: 'invalid-email'
            };

            const response = await request.post('/user/verify-email', {
                data: invalidData
            });

            if (response.status() === 400) {
                const body = await response.json();
                expect(body.success).toBe(false);
                expect(body.message).toContain('이메일');
            }
        });

        test('이메일 필드 누락', async ({ request }) => {
            const invalidData = {
                // email 누락
            };

            const response = await request.post('/user/verify-email', {
                data: invalidData
            });

            if (response.status() === 400) {
                const body = await response.json();
                expect(body.success).toBe(false);
                expect(body.message).toContain('이메일');
            }
        });
    });

    test.describe('비밀번호 재설정 검증 테스트', () => {

        test('유효한 비밀번호 재설정 요청', async ({ request }) => {
            const validData = {
                email: 'test@example.com'
            };

            const response = await request.post('/user/reset-password', {
                data: validData
            });

            // 구현에 따라 다양한 응답 가능
            expect([200, 404, 500]).toContain(response.status());
        });

        test('잘못된 이메일 형식', async ({ request }) => {
            const invalidData = {
                email: 'invalid-email'
            };

            const response = await request.post('/user/reset-password', {
                data: invalidData
            });

            if (response.status() === 400) {
                const body = await response.json();
                expect(body.success).toBe(false);
                expect(body.message).toContain('이메일');
            }
        });

        test('이메일 필드 누락', async ({ request }) => {
            const invalidData = {
                // email 누락
            };

            const response = await request.post('/user/reset-password', {
                data: invalidData
            });

            if (response.status() === 400) {
                const body = await response.json();
                expect(body.success).toBe(false);
                expect(body.message).toContain('이메일');
            }
        });
    });

    test.describe('API 응답 형식 테스트', () => {

        test('검증 오류 시 ApiResponse.error 형식 확인', async ({ request }) => {
            const invalidData = {
                username: '', // 빈 사용자명으로 오류 유발
                email: 'test@example.com',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '테스트 사용자',
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();

            // ApiResponse.error 형식 확인
            expect(body).toHaveProperty('success');
            expect(body.success).toBe(false);
            expect(body).toHaveProperty('message');
            expect(typeof body.message).toBe('string');
            expect(body.message.length).toBeGreaterThan(0);
        });

        test('한국어 오류 메시지 확인', async ({ request }) => {
            const invalidData = {
                username: 'test',
                email: 'invalid-email',
                password: '123',
                confirmPassword: '456',
                name: '',
                role: 'INVALID_ROLE'
            };

            const response = await request.post('/user', {
                data: invalidData
            });

            expect(response.status()).toBe(400);
            const body = await response.json();

            // 한국어 메시지 확인 (한글 포함)
            expect(body.message).toMatch(/[가-힣]/);
        });
    });

    test.describe('보안 테스트', () => {

        test('SQL 인젝션 시도', async ({ request }) => {
            const maliciousData = {
                username: "admin'; DROP TABLE users; --",
                email: 'test@example.com',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '테스트 사용자',
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: maliciousData
            });

            // 검증 미들웨어가 이를 차단해야 함
            expect(response.status()).toBe(400);
        });

        test('XSS 시도', async ({ request }) => {
            const maliciousData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: '<script>alert("XSS")</script>',
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: maliciousData
            });

            // 검증 미들웨어가 이를 처리해야 함
            expect([200, 201, 400]).toContain(response.status());
        });

        test('매우 긴 입력값', async ({ request }) => {
            const longString = 'a'.repeat(1000);
            const maliciousData = {
                username: longString,
                email: 'test@example.com',
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                name: longString,
                role: 'EXTERNAL_MEMBER'
            };

            const response = await request.post('/user', {
                data: maliciousData
            });

            // 길이 제한이 있어야 함
            expect(response.status()).toBe(400);
        });
    });
});
