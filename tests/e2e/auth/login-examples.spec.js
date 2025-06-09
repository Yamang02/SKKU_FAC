/**
 * 로그인 기능 테스트 예시
 * 역할별 대표 사용자들을 활용한 로그인 테스트
 */
import { test, expect } from '@playwright/test';
import {
    loginAsAdmin,
    loginAsSkkuMember,
    loginAsExternalMember,
    loginForFeature,
    logout,
    clearSession
} from '../helpers/simple-login.js';
import { getAllTestUsers } from '../fixtures/login-users.js';

test.describe('로그인 기능 테스트', () => {

    test.beforeEach(async ({ page }) => {
        // 각 테스트 전에 세션 초기화
        await clearSession(page);
    });

    test('관리자 로그인 테스트', async ({ page }) => {
        await loginAsAdmin(page);

        // 관리자 페이지 접근 가능한지 확인
        await page.goto('http://localhost:3000/admin');
        await page.waitForLoadState('networkidle');

        // 관리자 페이지가 로드되었는지 확인 (403이나 리다이렉트 없이)
        const currentUrl = page.url();
        expect(currentUrl).toContain('/admin');
    });

    test('SKKU 멤버 로그인 테스트', async ({ page }) => {
        await loginAsSkkuMember(page);

        // SKKU 멤버 대시보드나 메인 페이지 확인
        const currentUrl = page.url();
        expect(currentUrl).not.toContain('/login');

        // 로그인 상태 확인 (로그아웃 버튼 존재)
        const logoutButton = page.locator('a[href="/user/logout"], button:has-text("로그아웃")');
        await expect(logoutButton).toBeVisible();
    });

    test('외부 멤버 로그인 테스트', async ({ page }) => {
        await loginAsExternalMember(page);

        // 로그인 성공 확인
        const currentUrl = page.url();
        expect(currentUrl).not.toContain('/login');
    });

    test('모든 사용자 순차 로그인 테스트', async ({ page }) => {
        const testUsers = getAllTestUsers();

        for (const user of testUsers) {
            console.log(`🔄 테스트 중: ${user.role} - ${user.username}`);

            // 세션 초기화
            await clearSession(page);

            // 로그인 페이지로 이동
            await page.goto('http://localhost:3000/user/login');
            await page.waitForLoadState('networkidle');

            // 로그인 정보 입력
            await page.fill('#username', user.username);
            await page.fill('#password', user.password);

            // 로그인 버튼 클릭
            const loginButton = page.locator('button[type="submit"]');
            await loginButton.click();

            // 로그인 성공 확인
            await page.waitForTimeout(2000);
            const currentUrl = page.url();
            expect(currentUrl).not.toContain('/login');

            console.log(`✅ ${user.role} 로그인 성공`);
        }
    });

    test('기능별 로그인 테스트', async ({ page }) => {
        // 관리자 전용 기능
        await clearSession(page);
        await loginForFeature(page, 'admin_panel');
        await page.goto('http://localhost:3000/admin');
        expect(page.url()).toContain('/admin');

        // SKKU 멤버 기능
        await clearSession(page);
        await loginForFeature(page, 'skku_artwork_upload');
        // artwork 업로드 페이지나 기능 테스트 가능

        // 외부 멤버 기능
        await clearSession(page);
        await loginForFeature(page, 'public_exhibition_view');
        // 전시 보기 기능 테스트 가능
    });

    test('로그아웃 테스트', async ({ page }) => {
        // 먼저 로그인
        await loginAsSkkuMember(page);

        // 로그아웃 수행
        await logout(page);

        // 로그인 페이지로 리다이렉트되었는지 확인
        await page.waitForTimeout(1000);
        const currentUrl = page.url();
        expect(currentUrl).toContain('/login');
    });
});
