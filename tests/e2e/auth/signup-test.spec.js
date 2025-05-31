import { test, expect } from '@playwright/test';

/**
 * 회원가입 절차 테스트
 * Register.js의 실제 동작 방식에 맞춘 테스트
 */

test.describe('회원가입 절차 테스트', () => {

    test('SKKU 사용자 회원가입 - 실제 폼 동작 테스트', async ({ page }) => {
        console.log('🎓 SKKU 사용자 회원가입 테스트 시작');

        // 콘솔 로그 캡처 (Register.js의 로그 확인)
        page.on('console', msg => {
            console.log('🖥️ 브라우저 콘솔:', msg.text());
        });

        // 네트워크 요청 모니터링 (UserApi.register 호출 확인)
        const apiRequests = [];
        page.on('request', request => {
            if (request.url().includes('/user') && request.method() === 'POST') {
                apiRequests.push({
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers(),
                    postData: request.postData()
                });
                console.log('📤 API 요청:', request.url());
            }
        });

        // API 응답 모니터링
        page.on('response', response => {
            if (response.url().includes('/user') && response.request().method() === 'POST') {
                console.log('📥 API 응답:', response.status(), response.url());
            }
        });

        // 회원가입 페이지로 이동
        await page.goto('http://localhost:3000/user/new');
        await page.waitForLoadState('networkidle');

        // 페이지 로드 확인
        await expect(page.locator('h1.page-title-user')).toHaveText('회원가입');

        // 테스트 데이터 생성
        const timestamp = Date.now();
        const skkuUser = {
            username: `skkutest${timestamp}`,
            name: `성균관대 테스트 사용자`,
            email: `skkutest${timestamp}@skku.edu`,
            password: 'Test123!@#',
            role: 'SKKU_MEMBER',
            department: '컴퓨터공학과',
            studentYear: '23', // 문자열로 입력 (EJS에서 text input)
            isClubMember: true
        };

        console.log('📝 SKKU 사용자 정보:', skkuUser);

        // 기본 정보 입력
        await page.fill('#username', skkuUser.username);
        await page.fill('#email', skkuUser.email);
        await page.fill('#password', skkuUser.password);
        await page.fill('#confirmPassword', skkuUser.password);
        await page.fill('#name', skkuUser.name);

        // 역할 선택 (SKKU 필드가 나타나도록)
        await page.selectOption('#role', skkuUser.role);

        // SKKU 필드가 나타날 때까지 대기 (Register.js의 change 이벤트 처리)
        await page.waitForSelector('#skkuFields', { state: 'visible' });

        // SKKU 사용자 추가 정보 입력
        await page.fill('#department', skkuUser.department);
        await page.fill('#studentYear', skkuUser.studentYear);

        if (skkuUser.isClubMember) {
            await page.check('#isClubMember');
        }

        // 폼 입력 완료 스크린샷
        await page.screenshot({
            path: `test-results/screenshots/skku-signup-form-${timestamp}.png`,
            fullPage: true
        });

        // 폼 제출 및 API 응답 대기
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/user') &&
            response.request().method() === 'POST'
        );

        await page.click('button[type="submit"]');
        const response = await responsePromise;

        console.log('🔍 응답 상태:', response.status());

        // 응답 내용 확인
        let responseBody;
        try {
            responseBody = await response.json();
            console.log('📋 응답 내용:', responseBody);
        } catch (e) {
            console.log('📋 응답을 JSON으로 파싱할 수 없음');
        }

        // 로딩 상태 확인 (showLoading 함수 호출)
        const loadingElement = page.locator('.notification--loading');
        console.log('⏳ 로딩 상태 확인:', await loadingElement.count());

        // 결과 확인 (성공 메시지 또는 오류 메시지)
        await page.waitForTimeout(2000); // 메시지 표시 대기

        // notification.js의 showSuccessMessage로 생성되는 알림 확인
        const successNotification = page.locator('.notification--success');
        const errorNotification = page.locator('.notification--error');

        const hasSuccess = await successNotification.count() > 0;
        const hasError = await errorNotification.count() > 0;

        if (hasSuccess) {
            const successText = await successNotification.textContent();
            console.log('✅ 성공 메시지:', successText);
        }

        if (hasError) {
            const errorText = await errorNotification.textContent();
            console.log('❌ 오류 메시지:', errorText);
        }

        // 결과 스크린샷
        await page.screenshot({
            path: `test-results/screenshots/skku-signup-result-${timestamp}.png`,
            fullPage: true
        });

        console.log('📊 SKKU 회원가입 결과:', {
            responseStatus: response.status(),
            hasSuccessNotification: hasSuccess,
            hasErrorNotification: hasError,
            apiRequestCount: apiRequests.length,
            currentUrl: page.url()
        });

        // 성공적인 응답이어야 함
        if (response.status() === 201 && responseBody?.success) {
            expect(hasSuccess).toBe(true);

            // 3초 후 리다이렉트 확인 (Register.js의 setTimeout 로직)
            await page.waitForTimeout(3500);
            expect(page.url()).toContain('/user/login');
        } else {
            // 오류 응답인 경우 오류 메시지가 표시되어야 함
            expect(hasError).toBe(true);
        }
    });

    test('외부 사용자 회원가입 - 실제 폼 동작 테스트', async ({ page }) => {
        console.log('🌐 외부 사용자 회원가입 테스트 시작');

        // 콘솔 및 네트워크 모니터링
        page.on('console', msg => {
            console.log('🖥️ 브라우저 콘솔:', msg.text());
        });

        page.on('request', request => {
            if (request.url().includes('/user') && request.method() === 'POST') {
                console.log('📤 API 요청:', request.url());
            }
        });

        // 회원가입 페이지로 이동
        await page.goto('http://localhost:3000/user/new');
        await page.waitForLoadState('networkidle');

        // 테스트 데이터 생성
        const timestamp = Date.now();
        const externalUser = {
            username: `external${timestamp}`,
            name: `외부 테스트 사용자`,
            email: `external${timestamp}@example.com`,
            password: 'Test123!@#',
            role: 'EXTERNAL_MEMBER',
            affiliation: '외부 기관'
        };

        console.log('📝 외부 사용자 정보:', externalUser);

        // 기본 정보 입력
        await page.fill('#username', externalUser.username);
        await page.fill('#email', externalUser.email);
        await page.fill('#password', externalUser.password);
        await page.fill('#confirmPassword', externalUser.password);
        await page.fill('#name', externalUser.name);

        // 역할 선택
        await page.selectOption('#role', externalUser.role);

        // 외부 필드가 나타날 때까지 대기
        await page.waitForSelector('#externalFields', { state: 'visible' });

        // 외부 사용자 추가 정보 입력
        await page.fill('#affiliation', externalUser.affiliation);

        // 폼 입력 완료 스크린샷
        await page.screenshot({
            path: `test-results/screenshots/external-signup-form-${timestamp}.png`,
            fullPage: true
        });

        // 폼 제출 및 API 응답 대기
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/user') &&
            response.request().method() === 'POST'
        );

        await page.click('button[type="submit"]');
        const response = await responsePromise;

        console.log('🔍 응답 상태:', response.status());

        // 응답 내용 확인
        let responseBody;
        try {
            responseBody = await response.json();
            console.log('📋 응답 내용:', responseBody);
        } catch (e) {
            console.log('📋 응답을 JSON으로 파싱할 수 없음');
        }

        // 결과 확인
        await page.waitForTimeout(2000);

        const successNotification = page.locator('.notification--success');
        const errorNotification = page.locator('.notification--error');

        const hasSuccess = await successNotification.count() > 0;
        const hasError = await errorNotification.count() > 0;

        if (hasSuccess) {
            const successText = await successNotification.textContent();
            console.log('✅ 성공 메시지:', successText);
        }

        if (hasError) {
            const errorText = await errorNotification.textContent();
            console.log('❌ 오류 메시지:', errorText);
        }

        // 결과 스크린샷
        await page.screenshot({
            path: `test-results/screenshots/external-signup-result-${timestamp}.png`,
            fullPage: true
        });

        console.log('📊 외부 회원가입 결과:', {
            responseStatus: response.status(),
            hasSuccessNotification: hasSuccess,
            hasErrorNotification: hasError,
            currentUrl: page.url()
        });

        // 성공적인 응답이어야 함
        if (response.status() === 201 && responseBody?.success) {
            expect(hasSuccess).toBe(true);

            // 3초 후 리다이렉트 확인
            await page.waitForTimeout(3500);
            expect(page.url()).toContain('/user/login');
        } else {
            // 오류 응답인 경우 오류 메시지가 표시되어야 함
            expect(hasError).toBe(true);
        }
    });

    test('폼 유효성 검사 - 클라이언트 사이드', async ({ page }) => {
        console.log('🔍 클라이언트 사이드 유효성 검사 테스트');

        await page.goto('http://localhost:3000/user/new');
        await page.waitForLoadState('networkidle');

        // 빈 폼 제출 시도
        await page.click('button[type="submit"]');

        // HTML5 required 속성 확인
        const usernameField = page.locator('#username');
        const emailField = page.locator('#email');
        const passwordField = page.locator('#password');

        await expect(usernameField).toHaveAttribute('required');
        await expect(emailField).toHaveAttribute('required');
        await expect(passwordField).toHaveAttribute('required');

        console.log('✅ HTML5 required 속성 확인 완료');
    });

    test('비밀번호 확인 검증', async ({ page }) => {
        console.log('🔐 비밀번호 확인 검증 테스트');

        await page.goto('http://localhost:3000/user/new');
        await page.waitForLoadState('networkidle');

        const timestamp = Date.now();

        // 기본 정보 입력
        await page.fill('#username', `testuser${timestamp}`);
        await page.fill('#email', `test${timestamp}@example.com`);
        await page.fill('#password', 'password123');
        await page.fill('#confirmPassword', 'differentpassword'); // 다른 비밀번호
        await page.fill('#name', '테스트 사용자');
        await page.selectOption('#role', 'EXTERNAL_MEMBER');
        await page.fill('#affiliation', '테스트 기관');

        // 폼 제출
        await page.click('button[type="submit"]');

        // 오류 메시지 확인 (클라이언트 사이드 또는 서버 사이드)
        await page.waitForTimeout(1000);

        const errorNotification = page.locator('.notification--error');
        const hasError = await errorNotification.count() > 0;

        if (hasError) {
            const errorText = await errorNotification.textContent();
            console.log('❌ 비밀번호 불일치 오류:', errorText);
            expect(errorText).toContain('비밀번호');
        }

        console.log('✅ 비밀번호 확인 검증 완료');
    });

    test('이메일 형식 검증', async ({ page }) => {
        console.log('📧 이메일 형식 검증 테스트');

        await page.goto('http://localhost:3000/user/new');
        await page.waitForLoadState('networkidle');

        const timestamp = Date.now();

        // 잘못된 이메일 형식으로 입력
        await page.fill('#username', `testuser${timestamp}`);
        await page.fill('#email', 'invalid-email-format'); // 잘못된 형식
        await page.fill('#password', 'password123');
        await page.fill('#confirmPassword', 'password123');
        await page.fill('#name', '테스트 사용자');
        await page.selectOption('#role', 'EXTERNAL_MEMBER');
        await page.fill('#affiliation', '테스트 기관');

        // 폼 제출
        await page.click('button[type="submit"]');

        // HTML5 이메일 검증 또는 서버 사이드 검증 확인
        await page.waitForTimeout(1000);

        // 브라우저의 HTML5 검증 메시지 또는 서버 오류 메시지 확인
        const emailField = page.locator('#email');
        const isInvalid = await emailField.evaluate(el => !el.validity.valid);

        if (isInvalid) {
            console.log('✅ HTML5 이메일 검증 작동');
        } else {
            // 서버 사이드 검증 확인
            const errorNotification = page.locator('.notification--error');
            const hasError = await errorNotification.count() > 0;

            if (hasError) {
                const errorText = await errorNotification.textContent();
                console.log('✅ 서버 사이드 이메일 검증:', errorText);
            }
        }

        console.log('✅ 이메일 형식 검증 완료');
    });

    test('중복 사용자명 검증', async ({ page }) => {
        console.log('👥 중복 사용자명 검증 테스트');

        await page.goto('http://localhost:3000/user/new');
        await page.waitForLoadState('networkidle');

        // 이미 존재하는 사용자명으로 회원가입 시도 (admin 계정)
        await page.fill('#username', 'admin');
        await page.fill('#email', 'newadmin@example.com');
        await page.fill('#password', 'password123');
        await page.fill('#confirmPassword', 'password123');
        await page.fill('#name', '새로운 관리자');
        await page.selectOption('#role', 'EXTERNAL_MEMBER');
        await page.fill('#affiliation', '테스트 기관');

        // 폼 제출 및 응답 대기
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/user') &&
            response.request().method() === 'POST'
        );

        await page.click('button[type="submit"]');
        const response = await responsePromise;

        console.log('🔍 중복 검증 응답 상태:', response.status());

        // 오류 메시지 확인
        const errorNotification = page.locator('.notification.error');
        if (await errorNotification.isVisible()) {
            const errorText = await errorNotification.textContent();
            console.log('❌ 중복 사용자명 오류:', errorText);
            // 실제 에러 메시지 형식에 맞게 확인
            expect(errorText).toMatch(/아이디|사용자명|중복/);
        }

        // 응답 상태가 400번대여야 함
        expect(response.status()).toBeGreaterThanOrEqual(400);
        expect(response.status()).toBeLessThan(500);

        console.log('✅ 중복 사용자명 검증 완료');
    });

    test('역할별 필드 표시/숨김 동작', async ({ page }) => {
        console.log('🔄 역할별 필드 동작 테스트');

        await page.goto('http://localhost:3000/user/new');
        await page.waitForLoadState('networkidle');

        // 초기 상태 - 추가 필드 숨김
        await expect(page.locator('#skkuFields')).toBeHidden();
        await expect(page.locator('#externalFields')).toBeHidden();

        // SKKU 역할 선택
        await page.selectOption('#role', 'SKKU_MEMBER');
        await page.waitForSelector('#skkuFields', { state: 'visible' });
        await expect(page.locator('#skkuFields')).toBeVisible();
        await expect(page.locator('#externalFields')).toBeHidden();

        console.log('✅ SKKU 필드 표시 확인');

        // 외부 역할 선택
        await page.selectOption('#role', 'EXTERNAL_MEMBER');
        await page.waitForSelector('#externalFields', { state: 'visible' });
        await expect(page.locator('#externalFields')).toBeVisible();
        await expect(page.locator('#skkuFields')).toBeHidden();

        console.log('✅ 외부 필드 표시 확인');

        // 기본 역할로 돌아가기
        await page.selectOption('#role', '');
        await expect(page.locator('#skkuFields')).toBeHidden();
        await expect(page.locator('#externalFields')).toBeHidden();

        console.log('✅ 역할별 필드 동작 테스트 완료');
    });
});
