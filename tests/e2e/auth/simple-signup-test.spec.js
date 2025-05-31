import { test, expect } from '@playwright/test';
import { generateTestUser, generateSKKUTestUser, generateExternalTestUser, captureScreenshot } from '../helpers/test-helpers.js';

/**
 * 간단한 회원가입 테스트
 * 기본적인 회원가입 플로우만 확인
 */

test.describe('간단한 회원가입 테스트', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/user/new');
        await captureScreenshot(page, 'signup-page-loaded');
    });

    test('SKKU 사용자 회원가입 - affiliation null 허용', async ({ page }) => {
        const userData = generateSKKUTestUser();

        await page.fill('#username', userData.username);
        await page.fill('#name', userData.name);
        await page.fill('#email', userData.email);
        await page.fill('#password', userData.password);
        await page.fill('#confirmPassword', userData.confirmPassword);

        // SKKU 회원 선택
        await page.selectOption('#role', 'SKKU_MEMBER');

        // SKKU 필드가 나타날 때까지 대기
        await page.waitForSelector('#skkuFields', { state: 'visible' });

        // 학과와 학번 입력 (affiliation은 입력하지 않음)
        await page.fill('#department', '미술학과');
        await page.fill('#studentYear', '23');

        await captureScreenshot(page, 'skku-signup-form-filled');

        // 폼 제출
        await page.click('button[type="submit"]');

        // 성공 또는 중복 오류 확인
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'skku-signup-result');

        const successMessage = await page.locator('.alert-success-user').textContent();
        const errorMessage = await page.locator('.alert-danger-user').textContent();

        if (successMessage && successMessage.trim()) {
            expect(successMessage).toContain('성공');
        } else if (errorMessage && errorMessage.trim()) {
            // 중복 오류는 허용 (이미 존재하는 사용자)
            expect(errorMessage).toMatch(/(이미 존재|중복|duplicate)/i);
        }
    });

    test('외부 사용자 회원가입 - affiliation 필수', async ({ page }) => {
        const userData = generateExternalTestUser();

        await page.fill('#username', userData.username);
        await page.fill('#name', userData.name);
        await page.fill('#email', userData.email);
        await page.fill('#password', userData.password);
        await page.fill('#confirmPassword', userData.confirmPassword);

        // 외부 회원 선택
        await page.selectOption('#role', 'EXTERNAL_MEMBER');

        // 외부 필드가 나타날 때까지 대기
        await page.waitForSelector('#externalFields', { state: 'visible' });

        // affiliation 입력
        await page.fill('#affiliation', '외부 기관');

        await captureScreenshot(page, 'external-signup-form-filled');

        // 폼 제출
        await page.click('button[type="submit"]');

        // 성공 또는 중복 오류 확인
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'external-signup-result');

        const successMessage = await page.locator('.alert-success-user').textContent();
        const errorMessage = await page.locator('.alert-danger-user').textContent();

        if (successMessage && successMessage.trim()) {
            expect(successMessage).toContain('성공');
        } else if (errorMessage && errorMessage.trim()) {
            // 중복 오류는 허용 (이미 존재하는 사용자)
            expect(errorMessage).toMatch(/(이미 존재|중복|duplicate)/i);
        }
    });

    test('외부 사용자 회원가입 - affiliation 누락 시 오류', async ({ page }) => {
        const userData = generateExternalTestUser();

        await page.fill('#username', userData.username);
        await page.fill('#name', userData.name);
        await page.fill('#email', userData.email);
        await page.fill('#password', userData.password);
        await page.fill('#confirmPassword', userData.confirmPassword);

        // 외부 회원 선택
        await page.selectOption('#role', 'EXTERNAL_MEMBER');

        // 외부 필드가 나타날 때까지 대기
        await page.waitForSelector('#externalFields', { state: 'visible' });

        // affiliation을 입력하지 않음 (빈 상태로 둠)

        await captureScreenshot(page, 'external-signup-no-affiliation');

        // 폼 제출
        await page.click('button[type="submit"]');

        // 오류 메시지 확인 (notification.js에서 생성하는 알림)
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'external-signup-error');

        // notification.js에서 생성하는 오류 알림 확인
        const errorNotification = await page.locator('.notification--error').textContent();
        expect(errorNotification).toBeTruthy();
        expect(errorNotification).toContain('소속');
    });

    test('학번 형식 검증 - 2자리 숫자', async ({ page }) => {
        const userData = generateSKKUTestUser();

        await page.fill('#username', userData.username);
        await page.fill('#name', userData.name);
        await page.fill('#email', userData.email);
        await page.fill('#password', userData.password);
        await page.fill('#confirmPassword', userData.confirmPassword);

        // SKKU 회원 선택
        await page.selectOption('#role', 'SKKU_MEMBER');

        // SKKU 필드가 나타날 때까지 대기
        await page.waitForSelector('#skkuFields', { state: 'visible' });

        // 학과 입력
        await page.fill('#department', '미술학과');

        // 잘못된 학번 형식 입력 (문자 포함)
        await page.fill('#studentYear', 'ab');

        // 디버깅: 폼 필드 값들 확인
        const usernameValue = await page.inputValue('#username');
        const passwordValue = await page.inputValue('#password');
        const confirmPasswordValue = await page.inputValue('#confirmPassword');
        const studentYearValue = await page.inputValue('#studentYear');

        console.log('Form values:', {
            username: usernameValue,
            password: passwordValue,
            confirmPassword: confirmPasswordValue,
            studentYear: studentYearValue
        });

        await captureScreenshot(page, 'invalid-student-year');

        // 폼 제출
        await page.click('button[type="submit"]');

        // 오류 메시지 확인 (notification.js에서 생성하는 알림)
        await page.waitForTimeout(3000); // 더 긴 대기 시간
        await captureScreenshot(page, 'student-year-error');

        // 모든 notification 요소 확인
        const allNotifications = await page.locator('.notification').allTextContents();
        console.log('All notifications:', allNotifications);

        // notification.js에서 생성하는 오류 알림 확인
        const errorNotification = await page.locator('.notification--error').textContent();
        console.log('Error notification:', errorNotification);

        expect(errorNotification).toBeTruthy();
        expect(errorNotification).toContain('2자리');
    });

    test('00 학번 입력 테스트', async ({ page }) => {
        const userData = generateSKKUTestUser();

        await page.fill('#username', userData.username);
        await page.fill('#name', userData.name);
        await page.fill('#email', userData.email);
        await page.fill('#password', userData.password);
        await page.fill('#confirmPassword', userData.confirmPassword);

        // SKKU 회원 선택
        await page.selectOption('#role', 'SKKU_MEMBER');

        // SKKU 필드가 나타날 때까지 대기
        await page.waitForSelector('#skkuFields', { state: 'visible' });

        // 학과와 00 학번 입력
        await page.fill('#department', '미술학과');
        await page.fill('#studentYear', '00');

        await captureScreenshot(page, 'zero-student-year');

        // 폼 제출
        await page.click('button[type="submit"]');

        // 성공 또는 중복 오류 확인 (00 학번이 정상 처리되어야 함)
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'zero-student-year-result');

        const successMessage = await page.locator('.alert-success-user').textContent();
        const errorMessage = await page.locator('.alert-danger-user').textContent();

        if (successMessage && successMessage.trim()) {
            expect(successMessage).toContain('성공');
        } else if (errorMessage && errorMessage.trim()) {
            // 중복 오류는 허용, 하지만 학번 형식 오류는 안됨
            expect(errorMessage).toMatch(/(이미 존재|중복|duplicate)/i);
            expect(errorMessage).not.toContain('2자리');
        }
    });
});
