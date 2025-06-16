/**
 * 간단한 로그인 헬퍼 함수
 * 기존 활성화된 사용자들로 로그인하는 기능만 제공
 */
import { expect } from '@playwright/test';
import { getUserByRole, getUserForFeature } from '../fixtures/login-users.js';

/**
 * 사용자 로그인 (기본)
 */
export async function loginAs(page, userCredentials) {
    console.log(`🔑 로그인: ${userCredentials.username} (${userCredentials.role})`);

    await page.goto('http://localhost:3001/user/login');
    await page.waitForLoadState('networkidle');

    // 로그인 정보 입력
    await page.fill('#username', userCredentials.username);
    await page.fill('#password', userCredentials.password);

    // 로그인 버튼 클릭
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // 로그인 성공 확인 (로그인 페이지에서 벗어났는지 확인)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/user/login');

    console.log(`✅ 로그인 성공: ${userCredentials.username}`);
    return true;
}

/**
 * 역할별 로그인
 */
export async function loginByRole(page, role) {
    const user = getUserByRole(role);
    if (!user) {
        throw new Error(`역할 '${role}'에 대한 사용자를 찾을 수 없습니다.`);
    }
    return await loginAs(page, user);
}

/**
 * 기능별 로그인 (해당 기능에 접근 권한이 있는 사용자로 로그인)
 */
export async function loginForFeature(page, featureType) {
    const user = getUserForFeature(featureType);
    return await loginAs(page, user);
}

/**
 * 관리자로 로그인
 */
export async function loginAsAdmin(page) {
    return await loginByRole(page, 'ADMIN');
}

/**
 * SKKU 멤버로 로그인
 */
export async function loginAsSkkuMember(page) {
    return await loginByRole(page, 'SKKU_MEMBER');
}

/**
 * 외부 멤버로 로그인
 */
export async function loginAsExternalMember(page) {
    return await loginByRole(page, 'EXTERNAL_MEMBER');
}

/**
 * 로그아웃
 */
export async function logout(page) {
    console.log('🚪 로그아웃 시작');

    // 로그아웃 링크나 버튼 찾기 (실제 구현에 따라 조정)
    const logoutElement = page.locator('a[href="/user/logout"], button:has-text("로그아웃")');

    if (await logoutElement.count() > 0) {
        await logoutElement.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 로그아웃 완료');
        return true;
    } else {
        console.log('⚠️ 로그아웃 요소를 찾을 수 없음');
        return false;
    }
}

/**
 * 세션 초기화 (강제 로그아웃)
 */
export async function clearSession(page) {
    await page.context().clearCookies();
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    console.log('🧹 세션 초기화 완료');
}
