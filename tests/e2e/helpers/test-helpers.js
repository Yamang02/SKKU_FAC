import { expect } from '@playwright/test';

/**
 * 테스트 헬퍼 함수들
 * 공통으로 사용되는 테스트 유틸리티 함수들을 제공
 */

// ========================================
// 사용자 데이터 생성 함수들
// ========================================

/**
 * 일반 테스트 사용자 데이터 생성
 */
export function generateTestUser(prefix = 'test') {
    const timestamp = Date.now();
    return {
        username: `${prefix}${timestamp}`,
        email: `${prefix}${timestamp}@example.com`,
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        name: `${prefix} 테스트 사용자`,
        role: 'EXTERNAL_MEMBER',
        affiliation: '테스트 기관'
    };
}

/**
 * SKKU 테스트 사용자 데이터 생성
 */
export function generateSKKUTestUser(prefix = 'skku') {
    const timestamp = Date.now();
    return {
        username: `${prefix}${timestamp}`,
        email: `${prefix}${timestamp}@skku.edu`,
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        name: `${prefix} SKKU 사용자`,
        role: 'SKKU_MEMBER',
        department: '컴퓨터공학과',
        studentYear: '23'
    };
}

/**
 * 외부 테스트 사용자 데이터 생성
 */
export function generateExternalTestUser(prefix = 'external') {
    const timestamp = Date.now();
    return {
        username: `${prefix}${timestamp}`,
        email: `${prefix}${timestamp}@example.com`,
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        name: `${prefix} 외부 사용자`,
        role: 'EXTERNAL_MEMBER',
        affiliation: '외부 기관'
    };
}

// ========================================
// 로그인/회원가입 헬퍼 함수들
// ========================================

/**
 * 사용자 로그인
 */
export async function loginUser(page, username, password) {
    await page.goto('/user/login');
    await page.fill('#username, input[name="username"]', username);
    await page.fill('#password, input[name="password"]', password);
    await page.click('button[type="submit"]');
    await waitForPageLoad(page);
}

/**
 * 사용자 회원가입
 */
export async function registerUser(page, userData) {
    await page.goto('/user/new');

    // 기본 정보 입력
    await page.fill('#username, input[name="username"]', userData.username);
    await page.fill('#email, input[name="email"]', userData.email);
    await page.fill('#password, input[name="password"]', userData.password);
    await page.fill('#confirmPassword, input[name="confirmPassword"]', userData.confirmPassword);
    await page.fill('#name, input[name="name"]', userData.name);

    // 역할 선택
    await page.selectOption('#role, select[name="role"]', userData.role);

    // 역할별 추가 정보 입력
    if (userData.role === 'SKKU_MEMBER') {
        await page.waitForSelector('#skkuFields', { state: 'visible' });
        await page.fill('#department, input[name="department"]', userData.department);
        await page.fill('#studentYear, input[name="studentYear"]', userData.studentYear);
    } else if (userData.role === 'EXTERNAL_MEMBER') {
        await page.waitForSelector('#externalFields', { state: 'visible' });
        await page.fill('#affiliation, input[name="affiliation"]', userData.affiliation);
    }

    // 회원가입 제출
    await page.click('button[type="submit"]');
    await waitForPageLoad(page);
}

/**
 * 사용자 로그아웃
 */
export async function logoutUser(page) {
    const logoutButton = page.locator('a:has-text("로그아웃"), button:has-text("로그아웃"), .logout');
    if (await logoutButton.count() > 0) {
        await logoutButton.click();
        await waitForPageLoad(page);
    }
}

// ========================================
// 페이지 네비게이션 헬퍼 함수들
// ========================================

/**
 * 페이지 로드 완료 대기
 */
export async function waitForPageLoad(page, timeout = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
}

/**
 * 특정 요소가 나타날 때까지 대기
 */
export async function waitForElement(page, selector, timeout = 5000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * 특정 요소가 사라질 때까지 대기
 */
export async function waitForElementToDisappear(page, selector, timeout = 5000) {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
}

// ========================================
// 메시지 확인 헬퍼 함수들
// ========================================

/**
 * 성공 메시지 확인
 */
export async function expectSuccessMessage(page, message = null) {
    const successSelectors = [
        '.notification--success',
        '.alert-success',
        '.success-message',
        '.toast-success'
    ];

    let found = false;
    for (const selector of successSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
            await expect(element).toBeVisible();
            if (message) {
                await expect(element).toContainText(message);
            }
            found = true;
            break;
        }
    }

    if (!found && message) {
        // 메시지가 지정되었지만 성공 요소를 찾지 못한 경우, 페이지 전체에서 메시지 검색
        await expect(page.locator('body')).toContainText(message);
    }
}

/**
 * 오류 메시지 확인
 */
export async function expectErrorMessage(page, message = null) {
    const errorSelectors = [
        '.notification--error',
        '.alert-error',
        '.error-message',
        '.toast-error',
        '.alert-danger'
    ];

    let found = false;
    for (const selector of errorSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
            await expect(element).toBeVisible();
            if (message) {
                await expect(element).toContainText(message);
            }
            found = true;
            break;
        }
    }

    if (!found && message) {
        // 메시지가 지정되었지만 오류 요소를 찾지 못한 경우, 페이지 전체에서 메시지 검색
        await expect(page.locator('body')).toContainText(message);
    }
}

/**
 * 정보 메시지 확인
 */
export async function expectInfoMessage(page, message = null) {
    const infoSelectors = [
        '.notification--info',
        '.alert-info',
        '.info-message',
        '.toast-info'
    ];

    let found = false;
    for (const selector of infoSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
            await expect(element).toBeVisible();
            if (message) {
                await expect(element).toContainText(message);
            }
            found = true;
            break;
        }
    }

    if (!found && message) {
        await expect(page.locator('body')).toContainText(message);
    }
}

// ========================================
// 스크린샷 및 디버깅 헬퍼 함수들
// ========================================

/**
 * 스크린샷 캡처
 */
export async function captureScreenshot(page, name, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;

    await page.screenshot({
        path: `test-results/screenshots/${filename}`,
        fullPage: true,
        ...options
    });

    console.log(`📸 스크린샷 저장됨: ${filename}`);
}

/**
 * 페이지 HTML 저장
 */
export async function savePageHTML(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.html`;

    const content = await page.content();
    const fs = require('fs');
    const path = require('path');

    const dir = 'test-results/html';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(dir, filename), content);
    console.log(`💾 HTML 저장됨: ${filename}`);
}

/**
 * 콘솔 로그 캡처 시작
 */
export function startConsoleCapture(page) {
    const logs = [];

    page.on('console', msg => {
        logs.push({
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        });
    });

    return logs;
}

// ========================================
// 폼 입력 헬퍼 함수들
// ========================================

/**
 * 폼 필드 일괄 입력
 */
export async function fillForm(page, formData) {
    for (const [field, value] of Object.entries(formData)) {
        const selector = `#${field}, input[name="${field}"], select[name="${field}"], textarea[name="${field}"]`;
        const element = page.locator(selector);

        if (await element.count() > 0) {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());

            if (tagName === 'select') {
                await element.selectOption(value);
            } else {
                await element.fill(value);
            }
        }
    }
}

/**
 * 파일 업로드
 */
export async function uploadFile(page, fileInputSelector, filePath) {
    const fileInput = page.locator(fileInputSelector);
    await fileInput.setInputFiles(filePath);
}

// ========================================
// 모달 및 팝업 헬퍼 함수들
// ========================================

/**
 * 모달 열기 대기
 */
export async function waitForModal(page, timeout = 5000) {
    const modalSelectors = ['.modal', '.popup', '.dialog', '[role="dialog"]'];

    for (const selector of modalSelectors) {
        const modal = page.locator(selector);
        if (await modal.count() > 0) {
            await modal.waitFor({ state: 'visible', timeout });
            return modal;
        }
    }

    throw new Error('모달을 찾을 수 없습니다');
}

/**
 * 모달 닫기
 */
export async function closeModal(page) {
    const closeSelectors = [
        '.modal-close',
        '.close-button',
        'button:has-text("닫기")',
        'button:has-text("Close")',
        '[aria-label="Close"]'
    ];

    for (const selector of closeSelectors) {
        const closeButton = page.locator(selector);
        if (await closeButton.count() > 0) {
            await closeButton.click();
            return;
        }
    }

    // ESC 키로 모달 닫기 시도
    await page.keyboard.press('Escape');
}

// ========================================
// 데이터 검증 헬퍼 함수들
// ========================================

/**
 * 테이블 데이터 검증
 */
export async function validateTableData(page, tableSelector, expectedData) {
    const table = page.locator(tableSelector);
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0);

    if (expectedData && expectedData.length > 0) {
        for (let i = 0; i < Math.min(rowCount, expectedData.length); i++) {
            const row = rows.nth(i);
            const rowData = expectedData[i];

            for (const [column, value] of Object.entries(rowData)) {
                const cell = row.locator(`td:nth-child(${column}), td[data-column="${column}"]`);
                if (await cell.count() > 0) {
                    await expect(cell).toContainText(value);
                }
            }
        }
    }
}

/**
 * 목록 아이템 검증
 */
export async function validateListItems(page, listSelector, expectedItems) {
    const list = page.locator(listSelector);
    await expect(list).toBeVisible();

    const items = list.locator('li, .item, .card');
    const itemCount = await items.count();

    expect(itemCount).toBeGreaterThan(0);

    if (expectedItems && expectedItems.length > 0) {
        for (let i = 0; i < Math.min(itemCount, expectedItems.length); i++) {
            const item = items.nth(i);
            const expectedItem = expectedItems[i];

            if (typeof expectedItem === 'string') {
                await expect(item).toContainText(expectedItem);
            } else if (typeof expectedItem === 'object') {
                for (const [selector, value] of Object.entries(expectedItem)) {
                    const element = item.locator(selector);
                    if (await element.count() > 0) {
                        await expect(element).toContainText(value);
                    }
                }
            }
        }
    }
}

// ========================================
// API 테스트 헬퍼 함수들
// ========================================

/**
 * API 응답 검증
 */
export async function validateApiResponse(response, expectedStatus = 200, expectedData = null) {
    expect(response.status()).toBe(expectedStatus);

    if (expectedData) {
        const responseData = await response.json();

        for (const [key, value] of Object.entries(expectedData)) {
            expect(responseData).toHaveProperty(key, value);
        }
    }
}

/**
 * 인증된 API 요청
 */
export async function makeAuthenticatedRequest(request, method, url, data = null, token = null) {
    const options = {
        headers: {}
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.data = data;
        options.headers['Content-Type'] = 'application/json';
    }

    switch (method.toLowerCase()) {
        case 'get':
            return await request.get(url, options);
        case 'post':
            return await request.post(url, options);
        case 'put':
            return await request.put(url, options);
        case 'delete':
            return await request.delete(url, options);
        default:
            throw new Error(`지원하지 않는 HTTP 메서드: ${method}`);
    }
}

// ========================================
// 시간 및 날짜 헬퍼 함수들
// ========================================

/**
 * 현재 날짜 문자열 생성
 */
export function getCurrentDateString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * 미래 날짜 문자열 생성
 */
export function getFutureDateString(daysFromNow = 7) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
}

/**
 * 과거 날짜 문자열 생성
 */
export function getPastDateString(daysAgo = 7) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

// ========================================
// 랜덤 데이터 생성 헬퍼 함수들
// ========================================

/**
 * 랜덤 문자열 생성
 */
export function generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 랜덤 이메일 생성
 */
export function generateRandomEmail(domain = 'example.com') {
    const username = generateRandomString(8);
    return `${username}@${domain}`;
}

/**
 * 랜덤 한국어 이름 생성
 */
export function generateRandomKoreanName() {
    const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
    const names = ['민수', '영희', '철수', '영수', '미영', '정호', '수진', '현우', '지은', '태현'];

    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const name = names[Math.floor(Math.random() * names.length)];

    return surname + name;
}
