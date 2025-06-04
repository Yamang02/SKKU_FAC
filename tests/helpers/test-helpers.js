import { expect } from '@playwright/test';

/**
 * 테스트 헬퍼 함수들
 */

/**
 * 테스트용 사용자 데이터 생성
 */
export function generateTestUser(suffix = '') {
    const timestamp = Date.now();
    return {
        username: `testuser${suffix}${timestamp}`,
        name: `테스트 사용자${suffix}`,
        email: `test${suffix}${timestamp}@example.com`,
        password: 'Test123!@#',
        role: 'SKKU_MEMBER',
    };
}

/**
 * 테스트용 SKKU 사용자 데이터 생성
 */
export function generateSKKUTestUser(suffix = '') {
    const timestamp = Date.now();
    return {
        username: `skkuuser${suffix}${timestamp}`,
        name: `성균관대 사용자${suffix}`,
        email: `test${suffix}${timestamp}@skku.edu`,
        password: 'Test123!@#',
        role: 'SKKU_MEMBER',
        department: '컴퓨터공학과',
        studentYear: 3,
        isClubMember: true,
    };
}

/**
 * 테스트용 외부 사용자 데이터 생성
 */
export function generateExternalTestUser(suffix = '') {
    const timestamp = Date.now();
    return {
        username: `external${suffix}${timestamp}`,
        name: `외부 사용자${suffix}`,
        email: `external${suffix}${timestamp}@example.com`,
        password: 'Test123!@#',
        role: 'EXTERNAL_MEMBER',
        affiliation: '외부 기관',
    };
}

/**
 * 테스트용 관리자 데이터 생성
 */
export function generateAdminTestUser(suffix = '') {
    const timestamp = Date.now();
    return {
        username: `admin${suffix}${timestamp}`,
        name: `관리자${suffix}`,
        email: `admin${suffix}${timestamp}@skku.edu`,
        password: 'Admin123!@#',
        role: 'ADMIN',
        department: '미술학과',
        studentYear: 4,
        isClubMember: true,
    };
}

/**
 * 기본 관리자 계정 정보
 */
export const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
};

/**
 * 테스트용 기본 SKKU 사용자 (필요시 미리 생성된 계정)
 */
export const DEFAULT_SKKU_USER = {
    username: 'testskku',
    password: 'test123',
    role: 'SKKU_MEMBER',
};

/**
 * 테스트용 기본 외부 사용자 (필요시 미리 생성된 계정)
 */
export const DEFAULT_EXTERNAL_USER = {
    username: 'testexternal',
    password: 'test123',
    role: 'EXTERNAL_MEMBER',
};

/**
 * 사용자 로그인 헬퍼
 */
export async function loginUser(page, userData) {
    await page.goto('/user/login');
    await page.fill('#username', userData.username);
    await page.fill('#password', userData.password);
    await page.click('button[type="submit"]');

    // 로그인 성공 확인 (리다이렉트 또는 성공 메시지)
    await page.waitForURL(url => !url.includes('/login'));
}

/**
 * 관리자로 로그인
 */
export async function loginAsAdmin(page) {
    await loginUser(page, DEFAULT_ADMIN);
}

/**
 * SKKU 사용자로 로그인 (기본 계정 또는 새로 생성)
 */
export async function loginAsSKKUUser(page, createNew = false) {
    if (createNew) {
        const newUser = generateSKKUTestUser('login');
        await registerUser(page, newUser);
        await loginUser(page, newUser);
        return newUser;
    } else {
        await loginUser(page, DEFAULT_SKKU_USER);
        return DEFAULT_SKKU_USER;
    }
}

/**
 * 외부 사용자로 로그인 (기본 계정 또는 새로 생성)
 */
export async function loginAsExternalUser(page, createNew = false) {
    if (createNew) {
        const newUser = generateExternalTestUser('login');
        await registerUser(page, newUser);
        await loginUser(page, newUser);
        return newUser;
    } else {
        await loginUser(page, DEFAULT_EXTERNAL_USER);
        return DEFAULT_EXTERNAL_USER;
    }
}

/**
 * 로그아웃 헬퍼
 */
export async function logoutUser(page) {
    // 로그아웃 버튼 클릭 (실제 구현에 맞게 수정)
    const logoutButton = page.locator('a[href="/user/logout"], button:has-text("로그아웃"), .logout-btn');

    if ((await logoutButton.count()) > 0) {
        await logoutButton.click();
    } else {
        // 세션 쿠키 삭제로 로그아웃 시뮬레이션
        await page.context().clearCookies();
    }

    // 로그아웃 확인
    await page.goto('/');
}

/**
 * 사용자 회원가입 헬퍼
 */
export async function registerUser(page, userData) {
    await page.goto('/user/new');

    await page.fill('#username', userData.username);
    await page.fill('#name', userData.name);
    await page.fill('#email', userData.email);
    await page.fill('#password', userData.password);
    await page.fill('#confirmPassword', userData.password);

    if (userData.role) {
        await page.selectOption('#role', userData.role);
    }

    // SKKU 사용자 추가 정보
    if (userData.role === 'SKKU_MEMBER' && userData.department) {
        await page.fill('#department', userData.department);
        if (userData.studentYear) {
            await page.fill('#studentYear', userData.studentYear.toString());
        }
        if (userData.isClubMember !== undefined) {
            if (userData.isClubMember) {
                await page.check('#isClubMember');
            }
        }
    }

    // 외부 사용자 추가 정보
    if (userData.role === 'EXTERNAL_MEMBER' && userData.affiliation) {
        await page.fill('#affiliation', userData.affiliation);
    }

    await page.click('button[type="submit"]');
}

/**
 * API 요청 헬퍼 - 회원가입
 */
export async function registerUserAPI(page, userData) {
    return await page.request.post('/user', {
        data: userData,
    });
}

/**
 * API 요청 헬퍼 - 로그인
 */
export async function loginUserAPI(page, credentials) {
    return await page.request.post('/user/login', {
        data: {
            username: credentials.username,
            password: credentials.password,
        },
    });
}

/**
 * 로그인 상태 확인
 */
export async function isLoggedIn(page) {
    // 로그인 상태를 나타내는 요소 확인 (실제 구현에 맞게 수정)
    const loginIndicators = ['.user-menu', '.logout-btn', 'a[href="/user/logout"]', ':has-text("로그아웃")'];

    for (const indicator of loginIndicators) {
        if ((await page.locator(indicator).count()) > 0) {
            return true;
        }
    }
    return false;
}

/**
 * 로그인 상태별 테스트 실행 헬퍼
 */
export async function testWithLoginStates(page, testFunction, options = {}) {
    const { testLoggedOut = true, testSKKUUser = true, testExternalUser = true, testAdmin = true } = options;

    const results = {};

    // 1. 비로그인 상태 테스트
    if (testLoggedOut) {
        await logoutUser(page);
        results.loggedOut = await testFunction(page, 'LOGGED_OUT', null);
    }

    // 2. SKKU 사용자 로그인 상태 테스트
    if (testSKKUUser) {
        const skkuUser = await loginAsSKKUUser(page);
        results.skkuUser = await testFunction(page, 'SKKU_MEMBER', skkuUser);
        await logoutUser(page);
    }

    // 3. 외부 사용자 로그인 상태 테스트
    if (testExternalUser) {
        const externalUser = await loginAsExternalUser(page);
        results.externalUser = await testFunction(page, 'EXTERNAL_MEMBER', externalUser);
        await logoutUser(page);
    }

    // 4. 관리자 로그인 상태 테스트
    if (testAdmin) {
        await loginAsAdmin(page);
        results.admin = await testFunction(page, 'ADMIN', DEFAULT_ADMIN);
        await logoutUser(page);
    }

    return results;
}

/**
 * 권한별 접근 테스트 헬퍼
 */
export async function testAccessByRole(page, url, expectedResults = {}) {
    const {
        loggedOut: _loggedOut = 'redirect', // 'redirect', 'forbidden', 'allowed'
        skkuUser: _skkuUser = 'allowed',
        externalUser: _externalUser = 'allowed',
        admin: _admin = 'allowed',
    } = expectedResults;

    const results = {};

    // 비로그인 상태
    await logoutUser(page);
    await page.goto(url);
    results.loggedOut = await getAccessResult(page);

    // SKKU 사용자
    await loginAsSKKUUser(page);
    await page.goto(url);
    results.skkuUser = await getAccessResult(page);
    await logoutUser(page);

    // 외부 사용자
    await loginAsExternalUser(page);
    await page.goto(url);
    results.externalUser = await getAccessResult(page);
    await logoutUser(page);

    // 관리자
    await loginAsAdmin(page);
    await page.goto(url);
    results.admin = await getAccessResult(page);
    await logoutUser(page);

    return results;
}

/**
 * 페이지 접근 결과 확인
 */
async function getAccessResult(page) {
    const currentUrl = page.url();

    if (currentUrl.includes('/login')) {
        return 'redirect';
    }

    const statusCode = await page
        .evaluate(() => {
            return fetch(window.location.href).then(r => r.status);
        })
        .catch(() => 200);

    if (statusCode === 403 || statusCode === 401) {
        return 'forbidden';
    }

    return 'allowed';
}

/**
 * 페이지 로드 대기 헬퍼
 */
export async function waitForPageLoad(page, selector = 'body') {
    await page.waitForSelector(selector);
    await page.waitForLoadState('networkidle');
}

/**
 * 에러 메시지 확인 헬퍼
 */
export async function expectErrorMessage(page, expectedMessage) {
    const errorElement = page.locator('.error-message, .alert-danger-user, [data-testid="error"]');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedMessage);
}

/**
 * 성공 메시지 확인 헬퍼
 */
export async function expectSuccessMessage(page, expectedMessage) {
    const successElement = page.locator('.success-message, .alert-success-user, [data-testid="success"]');
    await expect(successElement).toBeVisible();
    await expect(successElement).toContainText(expectedMessage);
}

/**
 * 폼 검증 오류 확인 헬퍼
 */
export async function expectValidationError(page, fieldName, expectedMessage) {
    const fieldError = page.locator(`[data-field="${fieldName}"] .error, .field-error[data-field="${fieldName}"]`);
    await expect(fieldError).toBeVisible();
    await expect(fieldError).toContainText(expectedMessage);
}

/**
 * 테스트 데이터 정리 헬퍼 (필요시 구현)
 */
export async function cleanupTestData(page, userData) {
    // 테스트 후 생성된 데이터 정리
    // 실제 구현에서는 데이터베이스 정리 로직 추가
    console.log(`Cleaning up test data for user: ${userData.username}`);
}

/**
 * 랜덤 문자열 생성
 */
export function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 테스트 환경 확인
 */
export function isTestEnvironment() {
    return process.env.NODE_ENV === 'test';
}

/**
 * 스크린샷 캡처 헬퍼
 */
export async function captureScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
        path: `test-results/screenshots/${name}-${timestamp}.png`,
        fullPage: true,
    });
}
