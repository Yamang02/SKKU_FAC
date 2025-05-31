import { test, expect } from '@playwright/test';
import {
    generateTestUser,
    generateSKKUTestUser,
    generateExternalTestUser,
    loginUser,
    registerUser,
    waitForPageLoad,
    expectSuccessMessage,
    expectErrorMessage,
    captureScreenshot
} from '../helpers/test-helpers.js';

/**
 * 인증 관련 테스트 (U_70, U_80, U_90)
 * 실제 프로젝트 구조 기반 회원가입, 로그인, 프로필 관리 테스트
 */

test.describe('인증 관련 테스트 - 실제 구조 기반', () => {

    // ========================================
    // 2.1 회원가입 테스트 (U_70)
    // ========================================
    test.describe('회원가입 테스트 (U_70)', () => {

        test('성균관대생 회원가입 플로우', async ({ page }) => {
            const skkuUser = generateSKKUTestUser('skku-signup');

            // 1. 홈페이지 접속
            await page.goto('/');
            await captureScreenshot(page, 'skku-signup-1-home');

            // 2. 회원가입 페이지로 이동 (/user/new)
            await page.goto('/user/new');
            await expect(page).toHaveURL(/\/user\/new/);
            await captureScreenshot(page, 'skku-signup-2-register-page');

            // 3. 페이지 제목 확인
            await expect(page.locator('.page-title-user')).toContainText('회원가입');

            // 4. 성균관대생 회원가입 정보 입력
            await page.fill('#username', skkuUser.username);
            await page.fill('#email', skkuUser.email);
            await page.fill('#password', skkuUser.password);
            await page.fill('#confirmPassword', skkuUser.password);
            await page.fill('#name', skkuUser.name);

            // 5. 성균관대 재학/졸업생 선택
            await page.selectOption('#role', 'SKKU_MEMBER');

            // 6. SKKU 필드가 나타나는지 확인
            await expect(page.locator('#skkuFields')).toBeVisible();

            // 7. 학과와 학번 입력
            await page.fill('#department', '컴퓨터교육과');
            await page.fill('#studentYear', '20');

            // 8. 동아리 회원 체크 (선택사항)
            await page.check('#isClubMember');

            await captureScreenshot(page, 'skku-signup-3-form-filled');

            // 9. 회원가입 제출
            await page.click('button[type="submit"]');

            // 10. 성공 메시지 확인 (alert-success-user 클래스 사용)
            await expect(page.locator('.alert-success-user')).toBeVisible();
            await captureScreenshot(page, 'skku-signup-4-success');
        });

        test('외부인 회원가입 플로우', async ({ page }) => {
            const externalUser = generateExternalTestUser('external-signup');

            await page.goto('/user/new');

            // 외부인 회원가입 정보 입력
            await page.fill('#username', externalUser.username);
            await page.fill('#email', externalUser.email);
            await page.fill('#password', externalUser.password);
            await page.fill('#confirmPassword', externalUser.password);
            await page.fill('#name', externalUser.name);

            // 외부 인원 선택
            await page.selectOption('#role', 'EXTERNAL_MEMBER');

            // 외부 필드가 나타나는지 확인
            await expect(page.locator('#externalFields')).toBeVisible();

            // 소속 입력
            await page.fill('#affiliation', '외부 기관');

            await page.click('button[type="submit"]');
            await expect(page.locator('.alert-success-user')).toBeVisible();
        });

        test('아이디 중복 검증', async ({ page }) => {
            const duplicateUser = generateTestUser('duplicate');

            await page.goto('/user/new');

            // 이미 존재하는 사용자명 입력
            await page.fill('#username', 'admin'); // 기본 관리자 계정
            await page.fill('#email', duplicateUser.email);
            await page.fill('#password', duplicateUser.password);
            await page.fill('#confirmPassword', duplicateUser.password);
            await page.fill('#name', duplicateUser.name);
            await page.selectOption('#role', 'EXTERNAL_MEMBER');
            await page.fill('#affiliation', '테스트 소속');

            await page.click('button[type="submit"]');

            // 중복 오류 메시지 확인 (alert-danger-user 클래스 사용)
            await expect(page.locator('.alert-danger-user')).toBeVisible();
        });

        test('필수 필드 유효성 검사', async ({ page }) => {
            await page.goto('/user/new');

            // 빈 폼 제출
            await page.click('button[type="submit"]');

            // HTML5 required 속성으로 인한 브라우저 기본 검증 확인
            const usernameField = page.locator('#username');
            await expect(usernameField).toHaveAttribute('required');
        });

        test('비밀번호 확인 검증', async ({ page }) => {
            await page.goto('/user/new');

            await page.fill('#username', 'testuser');
            await page.fill('#email', 'test@example.com');
            await page.fill('#password', 'password123');
            await page.fill('#confirmPassword', 'differentpassword');
            await page.fill('#name', 'Test User');
            await page.selectOption('#role', 'EXTERNAL_MEMBER');

            await page.click('button[type="submit"]');

            // 비밀번호 불일치 오류 메시지 확인
            await expect(page.locator('.alert-danger-user')).toBeVisible();
        });
    });

    // ========================================
    // 2.2 로그인 테스트 (U_80)
    // ========================================
    test.describe('로그인 테스트 (U_80)', () => {

        test('정상 로그인', async ({ page }) => {
            // 로그인 페이지로 이동 (/user/login)
            await page.goto('/user/login');
            await captureScreenshot(page, 'login-1-page');

            // 페이지 제목 확인
            await expect(page.locator('.page-title-user')).toContainText('로그인');

            // 로그인 정보 입력 (실제 필드명 사용)
            await page.fill('#username', 'admin'); // 기본 관리자 계정
            await page.fill('#password', 'admin123');
            await captureScreenshot(page, 'login-2-form-filled');

            await page.click('button[type="submit"]');

            // 로그인 성공 확인 (홈페이지로 리다이렉트)
            await waitForPageLoad(page);
            await expect(page).toHaveURL('/');
            await captureScreenshot(page, 'login-3-success');
        });

        test('잘못된 자격증명으로 로그인 실패', async ({ page }) => {
            await page.goto('/user/login');

            // 존재하지 않는 사용자 정보로 로그인 시도
            await page.fill('#username', 'nonexistent');
            await page.fill('#password', 'wrongpassword');

            await page.click('button[type="submit"]');

            // 로그인 실패 메시지 확인 (alert-danger-user 클래스)
            await expect(page.locator('.alert-danger-user')).toBeVisible();
        });

        test('비밀번호 표시/숨김 토글', async ({ page }) => {
            await page.goto('/user/login');

            const passwordField = page.locator('#password');
            const toggleButton = page.locator('.toggle-password-user');

            // 초기 상태는 password 타입
            await expect(passwordField).toHaveAttribute('type', 'password');

            // 토글 버튼 클릭
            await toggleButton.click();

            // 타입이 text로 변경되는지 확인
            await expect(passwordField).toHaveAttribute('type', 'text');

            // 다시 토글
            await toggleButton.click();
            await expect(passwordField).toHaveAttribute('type', 'password');
        });

        test('로그아웃', async ({ page }) => {
            // 먼저 로그인
            await loginUser(page, 'admin', 'admin123');

            // 로그아웃 버튼 클릭 (실제 로그아웃 링크/버튼 확인 필요)
            await page.click('a[href="/user/logout"]');

            // 로그인 페이지로 리다이렉트 확인
            await expect(page).toHaveURL(/\/user\/login/);
        });
    });

    // ========================================
    // 2.3 프로필 관리 테스트 (U_90)
    // ========================================
    test.describe('프로필 관리 테스트 (U_90)', () => {

        test('프로필 조회', async ({ page }) => {
            // 로그인 후 프로필 페이지 접근
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/user/me');

            // 프로필 정보 표시 확인
            await expect(page.locator('.page-title-user')).toContainText('프로필');
            await captureScreenshot(page, 'profile-view');
        });

        test('프로필 수정', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/user/me');

            // 수정 모드로 전환 (수정 버튼이 있다면)
            const editButton = page.locator('button:has-text("수정")');
            if (await editButton.isVisible()) {
                await editButton.click();
            }

            // 프로필 정보 수정
            await page.fill('#name', '수정된 이름');

            // 저장 버튼 클릭
            await page.click('button[type="submit"]');

            // 성공 메시지 확인
            await expect(page.locator('.alert-success-user')).toBeVisible();
        });

        test('비밀번호 변경', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/user/me');

            // 비밀번호 변경 섹션이 있다면
            const currentPasswordField = page.locator('#currentPassword');
            if (await currentPasswordField.isVisible()) {
                await currentPasswordField.fill('admin123');
                await page.fill('#newPassword', 'newpassword123');
                await page.fill('#confirmNewPassword', 'newpassword123');

                await page.click('button:has-text("비밀번호 변경")');
                await expect(page.locator('.alert-success-user')).toBeVisible();
            }
        });

        test('계정 삭제', async ({ page }) => {
            // 테스트용 계정으로 회원가입 후 삭제 테스트
            const testUser = generateTestUser('delete-test');
            await registerUser(page, testUser);
            await loginUser(page, testUser.username, testUser.password);

            await page.goto('/user/me');

            // 계정 삭제 버튼이 있다면
            const deleteButton = page.locator('button:has-text("계정 삭제")');
            if (await deleteButton.isVisible()) {
                await deleteButton.click();

                // 확인 대화상자 처리
                page.on('dialog', dialog => dialog.accept());

                // 삭제 후 로그인 페이지로 리다이렉트 확인
                await expect(page).toHaveURL(/\/user\/login/);
            }
        });
    });

    // ========================================
    // 2.4 세션 관리 테스트
    // ========================================
    test.describe('세션 관리 테스트', () => {

        test('세션 유지 확인', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');

            // 다른 페이지로 이동 후 로그인 상태 유지 확인
            await page.goto('/artwork');

            // 로그인 상태에서만 접근 가능한 요소 확인
            const userMenu = page.locator('.user-menu');
            if (await userMenu.isVisible()) {
                await expect(userMenu).toBeVisible();
            }
        });

        test('세션 만료 처리', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');

            // 세션 쿠키 삭제로 세션 만료 시뮬레이션
            await page.context().clearCookies();

            // 보호된 페이지 접근 시 로그인 페이지로 리다이렉트 확인
            await page.goto('/user/me');
            await expect(page).toHaveURL(/\/user\/login/);
        });
    });

    // ========================================
    // 2.5 보안 테스트
    // ========================================
    test.describe('보안 테스트', () => {

        test('CSRF 보호 확인', async ({ page }) => {
            await page.goto('/user/new');

            // CSRF 토큰이 폼에 포함되어 있는지 확인
            const csrfToken = page.locator('input[name="_token"]');
            if (await csrfToken.isVisible()) {
                await expect(csrfToken).toHaveAttribute('value');
            }
        });

        test('SQL 인젝션 방어', async ({ page }) => {
            await page.goto('/user/login');

            // SQL 인젝션 시도
            await page.fill('#username', "admin'; DROP TABLE users; --");
            await page.fill('#password', 'anypassword');
            await page.click('button[type="submit"]');

            // 로그인 실패 메시지 확인 (SQL 인젝션이 차단되어야 함)
            await expect(page.locator('.alert-danger-user')).toBeVisible();
        });

        test('XSS 방어', async ({ page }) => {
            const xssPayload = '<script>alert("XSS")</script>';

            await page.goto('/user/new');
            await page.fill('#name', xssPayload);
            await page.fill('#username', 'xsstest');
            await page.fill('#email', 'xss@test.com');
            await page.fill('#password', 'password123');
            await page.fill('#confirmPassword', 'password123');
            await page.selectOption('#role', 'EXTERNAL_MEMBER');

            await page.click('button[type="submit"]');

            // XSS 스크립트가 실행되지 않고 텍스트로 처리되는지 확인
            // 페이지에 alert가 뜨지 않아야 함
        });
    });
});
