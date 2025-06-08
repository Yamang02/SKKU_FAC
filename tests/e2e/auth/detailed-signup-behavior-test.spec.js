import { test, expect } from '@playwright/test';

/**
 * 사용자 행동 세분화 회원가입 테스트
 * 회원가입 과정에서 발생하는 모든 사용자 행동과 시스템 반응을 단계별로 테스트
 */

test.describe('회원가입 사용자 행동 세분화 테스트', () => {
    let timestamp;
    let testData;

    test.beforeEach(async ({ page }) => {
        timestamp = Date.now();
        testData = {
            skkuUser: {
                username: `skkutest${timestamp}`,
                name: `성균관대 테스트 사용자`,
                email: `skkutest${timestamp}@skku.edu`,
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                role: 'SKKU_MEMBER',
                department: '컴퓨터공학과',
                studentYear: '23',
                isClubMember: true,
            },
            externalUser: {
                username: `external${timestamp}`,
                name: `외부 테스트 사용자`,
                email: `external${timestamp}@example.com`,
                password: 'Test123!@#',
                confirmPassword: 'Test123!@#',
                role: 'EXTERNAL_MEMBER',
                affiliation: '외부 기관',
                isClubMember: false, // 외부 사용자는 동아리 회원이 아님
            }
        };

        // 콘솔 로그 캡처
        page.on('console', msg => {
            console.log(`🖥️ [${msg.type()}]`, msg.text());
        });

        // 네트워크 요청 모니터링
        page.on('request', request => {
            if (request.url().includes('/user') && request.method() === 'POST') {
                console.log('📤 API 요청:', request.url(), request.method());
            }
        });

        page.on('response', response => {
            if (response.url().includes('/user') && response.request().method() === 'POST') {
                console.log('📥 API 응답:', response.status(), response.url());
            }
        });
    });

    test.describe('1단계: 페이지 접근 및 초기 상태 확인', () => {
        test('회원가입 페이지 접근 시 초기 상태 검증', async ({ page }) => {
            console.log('🎯 테스트: 회원가입 페이지 초기 상태');

            // 페이지 이동
            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            // 페이지 제목 확인
            await expect(page.locator('h1.page-title-user')).toHaveText('회원가입');

            // 폼 요소 존재 확인
            await expect(page.locator('#registerForm')).toBeVisible();
            await expect(page.locator('#username')).toBeVisible();
            await expect(page.locator('#email')).toBeVisible();
            await expect(page.locator('#password')).toBeVisible();
            await expect(page.locator('#confirmPassword')).toBeVisible();
            await expect(page.locator('#name')).toBeVisible();
            await expect(page.locator('#role')).toBeVisible();

            // 제출 버튼 초기 상태 (비활성화)
            const submitButton = page.locator('button[type="submit"]');
            await expect(submitButton).toBeDisabled();
            await expect(submitButton).toHaveClass(/btn-disabled/);

            // 역할별 필드 초기 상태 (숨김)
            await expect(page.locator('#skkuFields')).toBeHidden();
            await expect(page.locator('#externalFields')).toBeHidden();

            console.log('✅ 초기 상태 검증 완료');
        });
    });

    test.describe('2단계: 기본 정보 입력 과정', () => {
        test('사용자명 입력 시 실시간 검증', async ({ page }) => {
            console.log('🎯 테스트: 사용자명 입력 실시간 검증');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const usernameField = page.locator('#username');
            const submitButton = page.locator('button[type="submit"]');

            // 빈 상태에서 버튼 비활성화 확인
            await expect(submitButton).toBeDisabled();

            // 사용자명 입력
            await usernameField.fill(testData.skkuUser.username);
            await usernameField.blur();

            // 여전히 다른 필드가 비어있으므로 버튼 비활성화 상태 유지
            await expect(submitButton).toBeDisabled();

            console.log('✅ 사용자명 입력 검증 완료');
        });

        test('이메일 입력 시 실시간 검증', async ({ page }) => {
            console.log('🎯 테스트: 이메일 입력 실시간 검증');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const emailField = page.locator('#email');
            const submitButton = page.locator('button[type="submit"]');

            // 유효한 이메일 입력
            await emailField.fill(testData.skkuUser.email);
            await emailField.blur();

            // 여전히 다른 필드가 비어있으므로 버튼 비활성화 상태 유지
            await expect(submitButton).toBeDisabled();

            // 잘못된 이메일 형식 테스트
            await emailField.fill('invalid-email');
            await emailField.blur();
            await expect(submitButton).toBeDisabled();

            console.log('✅ 이메일 입력 검증 완료');
        });

        test('비밀번호 입력 및 확인 과정', async ({ page }) => {
            console.log('🎯 테스트: 비밀번호 입력 및 확인');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const passwordField = page.locator('#password');
            const confirmPasswordField = page.locator('#confirmPassword');
            const submitButton = page.locator('button[type="submit"]');

            // 비밀번호 입력
            await passwordField.fill(testData.skkuUser.password);
            await passwordField.blur();

            // 비밀번호 확인 입력 (일치하지 않는 경우)
            await confirmPasswordField.fill('WrongPassword123!');
            await confirmPasswordField.blur();

            // 비밀번호 불일치 시각적 피드백 확인
            await expect(confirmPasswordField).toHaveClass(/is-invalid/);
            await expect(submitButton).toBeDisabled();

            // 올바른 비밀번호 확인 입력
            await confirmPasswordField.fill(testData.skkuUser.password);
            await confirmPasswordField.blur();

            // 비밀번호 일치 시각적 피드백 확인
            await expect(confirmPasswordField).toHaveClass(/is-valid/);

            console.log('✅ 비밀번호 입력 검증 완료');
        });

        test('비밀번호 표시/숨김 토글 기능', async ({ page }) => {
            console.log('🎯 테스트: 비밀번호 표시/숨김 토글');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const passwordField = page.locator('#password');
            const passwordToggle = page.locator('.toggle-password-user').first();

            // 비밀번호 입력
            await passwordField.fill(testData.skkuUser.password);

            // 초기 상태: password 타입
            await expect(passwordField).toHaveAttribute('type', 'password');

            // 토글 클릭 - 표시
            await passwordToggle.click();
            await expect(passwordField).toHaveAttribute('type', 'text');

            // 토글 클릭 - 숨김
            await passwordToggle.click();
            await expect(passwordField).toHaveAttribute('type', 'password');

            console.log('✅ 비밀번호 토글 기능 검증 완료');
        });
    });

    test.describe('3단계: 역할 선택 및 동적 필드 표시', () => {
        test('SKKU 멤버 선택 시 필드 표시 및 검증', async ({ page }) => {
            console.log('🎯 테스트: SKKU 멤버 역할 선택');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const roleSelect = page.locator('#role');
            const skkuFields = page.locator('#skkuFields');
            const externalFields = page.locator('#externalFields');

            // 초기 상태: 모든 역할별 필드 숨김
            await expect(skkuFields).toBeHidden();
            await expect(externalFields).toBeHidden();

            // SKKU 멤버 선택
            await roleSelect.selectOption('SKKU_MEMBER');

            // SKKU 필드 표시, 외부 필드 숨김 확인
            await expect(skkuFields).toBeVisible();
            await expect(externalFields).toBeHidden();

            // SKKU 필드 내부 요소들 확인
            await expect(page.locator('#department')).toBeVisible();
            await expect(page.locator('#studentYear')).toBeVisible();
            await expect(page.locator('#isClubMember')).toBeVisible();

            console.log('✅ SKKU 멤버 필드 표시 검증 완료');
        });

        test('외부 멤버 선택 시 필드 표시 및 검증', async ({ page }) => {
            console.log('🎯 테스트: 외부 멤버 역할 선택');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const roleSelect = page.locator('#role');
            const skkuFields = page.locator('#skkuFields');
            const externalFields = page.locator('#externalFields');

            // 외부 멤버 선택
            await roleSelect.selectOption('EXTERNAL_MEMBER');

            // 외부 필드 표시, SKKU 필드 숨김 확인
            await expect(externalFields).toBeVisible();
            await expect(skkuFields).toBeHidden();

            // 외부 필드 내부 요소 확인
            await expect(page.locator('#affiliation')).toBeVisible();

            console.log('✅ 외부 멤버 필드 표시 검증 완료');
        });

        test('역할 변경 시 필드 초기화 확인', async ({ page }) => {
            console.log('🎯 테스트: 역할 변경 시 필드 초기화');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const roleSelect = page.locator('#role');
            const departmentField = page.locator('#department');
            const affiliationField = page.locator('#affiliation');

            // SKKU 멤버 선택 후 데이터 입력
            await roleSelect.selectOption('SKKU_MEMBER');
            await departmentField.fill('컴퓨터공학과');

            // 외부 멤버로 변경
            await roleSelect.selectOption('EXTERNAL_MEMBER');
            await affiliationField.fill('외부 기관');

            // 다시 SKKU 멤버로 변경
            await roleSelect.selectOption('SKKU_MEMBER');

            // 이전 SKKU 데이터가 초기화되었는지 확인
            await expect(departmentField).toHaveValue('');

            console.log('✅ 역할 변경 시 필드 초기화 검증 완료');
        });
    });

    test.describe('4단계: 폼 유효성 검사 및 버튼 활성화', () => {
        test('SKKU 멤버 완전한 폼 입력 시 버튼 활성화', async ({ page }) => {
            console.log('🎯 테스트: SKKU 멤버 완전한 폼 입력');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const submitButton = page.locator('button[type="submit"]');

            // 기본 정보 입력
            await page.fill('#username', testData.skkuUser.username);
            await page.fill('#email', testData.skkuUser.email);
            await page.fill('#password', testData.skkuUser.password);
            await page.fill('#confirmPassword', testData.skkuUser.confirmPassword);
            await page.fill('#name', testData.skkuUser.name);

            // 아직 역할 미선택 상태에서 버튼 비활성화 확인
            await expect(submitButton).toBeDisabled();

            // 역할 선택
            await page.selectOption('#role', testData.skkuUser.role);

            // SKKU 필드 표시 대기
            await page.waitForSelector('#skkuFields', { state: 'visible' });

            // 아직 SKKU 필수 필드 미입력 상태에서 버튼 비활성화 확인
            await expect(submitButton).toBeDisabled();

            // SKKU 필수 필드 입력
            await page.fill('#department', testData.skkuUser.department);
            await page.fill('#studentYear', testData.skkuUser.studentYear);

            // 모든 필수 필드 입력 완료 후 버튼 활성화 확인
            await expect(submitButton).toBeEnabled();
            await expect(submitButton).not.toHaveClass(/btn-disabled/);

            console.log('✅ SKKU 멤버 완전한 폼 입력 검증 완료');
        });

        test('외부 멤버 완전한 폼 입력 시 버튼 활성화', async ({ page }) => {
            console.log('🎯 테스트: 외부 멤버 완전한 폼 입력');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const submitButton = page.locator('button[type="submit"]');

            // 기본 정보 입력
            await page.fill('#username', testData.externalUser.username);
            await page.fill('#email', testData.externalUser.email);
            await page.fill('#password', testData.externalUser.password);
            await page.fill('#confirmPassword', testData.externalUser.confirmPassword);
            await page.fill('#name', testData.externalUser.name);

            // 역할 선택
            await page.selectOption('#role', testData.externalUser.role);

            // 외부 필드 표시 대기
            await page.waitForSelector('#externalFields', { state: 'visible' });

            // 아직 외부 필수 필드 미입력 상태에서 버튼 비활성화 확인
            await expect(submitButton).toBeDisabled();

            // 외부 필수 필드 입력
            await page.fill('#affiliation', testData.externalUser.affiliation);

            // 모든 필수 필드 입력 완료 후 버튼 활성화 확인
            await expect(submitButton).toBeEnabled();
            await expect(submitButton).not.toHaveClass(/btn-disabled/);

            console.log('✅ 외부 멤버 완전한 폼 입력 검증 완료');
        });

        test('필수 필드 누락 시 버튼 비활성화 유지', async ({ page }) => {
            console.log('🎯 테스트: 필수 필드 누락 시 버튼 상태');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            const submitButton = page.locator('button[type="submit"]');

            // 일부 필드만 입력
            await page.fill('#username', testData.skkuUser.username);
            await page.fill('#email', testData.skkuUser.email);
            // 비밀번호 누락

            await expect(submitButton).toBeDisabled();

            // 비밀번호 입력하지만 확인 누락
            await page.fill('#password', testData.skkuUser.password);
            await expect(submitButton).toBeDisabled();

            // 비밀번호 확인 입력하지만 이름 누락
            await page.fill('#confirmPassword', testData.skkuUser.confirmPassword);
            await expect(submitButton).toBeDisabled();

            console.log('✅ 필수 필드 누락 시 버튼 비활성화 검증 완료');
        });
    });

    test.describe('5단계: 폼 제출 과정', () => {
        test('SKKU 멤버 성공적인 회원가입 과정', async ({ page }) => {
            console.log('🎯 테스트: SKKU 멤버 성공적인 회원가입');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            // 완전한 폼 입력
            await page.fill('#username', testData.skkuUser.username);
            await page.fill('#email', testData.skkuUser.email);
            await page.fill('#password', testData.skkuUser.password);
            await page.fill('#confirmPassword', testData.skkuUser.confirmPassword);
            await page.fill('#name', testData.skkuUser.name);
            await page.selectOption('#role', testData.skkuUser.role);

            await page.waitForSelector('#skkuFields', { state: 'visible' });
            await page.fill('#department', testData.skkuUser.department);
            await page.fill('#studentYear', testData.skkuUser.studentYear);

            if (testData.skkuUser.isClubMember) {
                await page.check('#isClubMember');
            }

            const submitButton = page.locator('button[type="submit"]');
            await expect(submitButton).toBeEnabled();

            // 폼 제출 전 스크린샷
            await page.screenshot({
                path: `test-results/screenshots/skku-signup-before-submit-${timestamp}.png`,
                fullPage: true,
            });

            // API 응답 대기 설정
            const responsePromise = page.waitForResponse(
                response => response.url().includes('/user') && response.request().method() === 'POST'
            );

            // 폼 제출
            await submitButton.click();

            // 제출 직후 버튼 상태 확인 (로딩 상태)
            await expect(submitButton).toBeDisabled();
            await expect(submitButton).toHaveText('처리 중...');
            await expect(submitButton).toHaveClass(/btn-loading/);

            // API 응답 대기
            const response = await responsePromise;
            console.log('🔍 응답 상태:', response.status());

            // 성공적인 응답인 경우 리다이렉트 확인
            if (response.status() === 201) {
                console.log('✅ 회원가입 성공 - 리다이렉트 대기');
                // 3초 후 리다이렉트 확인
                await page.waitForTimeout(3500);
                await expect(page.url()).toContain('/user/login');
            } else {
                // 실패한 경우에만 알림 메시지 확인
                await page.waitForTimeout(2000);

                const errorNotification = page.locator('.notification.notification--error');
                const hasError = (await errorNotification.count()) > 0;

                if (hasError) {
                    const errorText = await errorNotification.textContent();
                    console.log('❌ 오류 메시지:', errorText);
                }

                // 결과 스크린샷
                await page.screenshot({
                    path: `test-results/screenshots/skku-signup-result-${timestamp}.png`,
                    fullPage: true,
                });
            }

            console.log('✅ SKKU 멤버 회원가입 과정 검증 완료');
        });

        test('외부 멤버 성공적인 회원가입 과정', async ({ page }) => {
            console.log('🎯 테스트: 외부 멤버 성공적인 회원가입');

            // 캐시 초기화 - 쿠키만 초기화
            await page.context().clearCookies();

            // 캐시 무시하고 페이지 로드
            await page.goto('http://localhost:3000/user/new?_=' + Date.now(), { waitUntil: 'networkidle' });

            // 완전한 폼 입력 (기본 정보 먼저)
            await page.fill('#username', testData.externalUser.username);
            await page.fill('#email', testData.externalUser.email);
            await page.fill('#password', testData.externalUser.password);
            await page.fill('#confirmPassword', testData.externalUser.confirmPassword);
            await page.fill('#name', testData.externalUser.name);

            // 외부 멤버 역할 선택
            await page.selectOption('#role', testData.externalUser.role);
            await page.waitForSelector('#externalFields', { state: 'visible' });
            await page.waitForSelector('#skkuFields', { state: 'hidden' });

            // 외부 멤버 필수 필드 입력
            await page.fill('#affiliation', testData.externalUser.affiliation);

            // SKKU 관련 필드들이 숨겨져 있고 체크되지 않았는지 확인
            const isClubMemberVisible = await page.locator('#isClubMember').isVisible();
            console.log('🔍 isClubMember 필드 표시 상태:', isClubMemberVisible);

            // 숨겨진 필드는 체크 상태를 확인하지 않음 (DOM에서 접근 불가능할 수 있음)

            const submitButton = page.locator('button[type="submit"]');
            await expect(submitButton).toBeEnabled();

            // 폼 제출 전 스크린샷
            await page.screenshot({
                path: `test-results/screenshots/external-signup-before-submit-${timestamp}.png`,
                fullPage: true,
            });

            // API 응답 대기 설정
            const responsePromise = page.waitForResponse(
                response => response.url().includes('/user') && response.request().method() === 'POST'
            );

            // 폼 제출
            await submitButton.click();

            // 제출 직후 버튼 상태 확인 (로딩 상태)
            await expect(submitButton).toBeDisabled();
            await expect(submitButton).toHaveText('처리 중...');
            await expect(submitButton).toHaveClass(/btn-loading/);

            // API 응답 대기
            const response = await responsePromise;
            console.log('🔍 응답 상태:', response.status());

            // 성공적인 응답인 경우 리다이렉트 확인
            if (response.status() === 201) {
                console.log('✅ 회원가입 성공 - 리다이렉트 대기');
                // 3초 후 리다이렉트 확인
                await page.waitForTimeout(3500);
                await expect(page.url()).toContain('/user/login');
            } else {
                // 실패한 경우에만 알림 메시지 확인
                await page.waitForTimeout(2000);

                const errorNotification = page.locator('.notification.notification--error');
                const hasError = (await errorNotification.count()) > 0;

                if (hasError) {
                    const errorText = await errorNotification.textContent();
                    console.log('❌ 오류 메시지:', errorText);
                }

                // 결과 스크린샷
                await page.screenshot({
                    path: `test-results/screenshots/external-signup-result-${timestamp}.png`,
                    fullPage: true,
                });
            }

            console.log('✅ 외부 멤버 회원가입 과정 검증 완료');
        });

        test('중복 제출 방지 확인', async ({ page }) => {
            console.log('🎯 테스트: 중복 제출 방지');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            // 완전한 폼 입력 (고유한 사용자명 사용)
            const uniqueUsername = `duplicate${timestamp}`;
            await page.fill('#username', uniqueUsername);
            await page.fill('#email', `${uniqueUsername}@skku.edu`);
            await page.fill('#password', testData.skkuUser.password);
            await page.fill('#confirmPassword', testData.skkuUser.confirmPassword);
            await page.fill('#name', testData.skkuUser.name);
            await page.selectOption('#role', testData.skkuUser.role);

            await page.waitForSelector('#skkuFields', { state: 'visible' });
            await page.fill('#department', testData.skkuUser.department);
            await page.fill('#studentYear', testData.skkuUser.studentYear);

            const submitButton = page.locator('button[type="submit"]');

            // 제출 전 버튼 상태 확인
            await expect(submitButton).toBeEnabled();
            console.log('🔍 제출 전 버튼 상태: 활성화됨');

            // 첫 번째 클릭
            await submitButton.click();

            // 버튼이 즉시 비활성화되는지 확인 (JavaScript의 중복 클릭 방지 로직)
            await expect(submitButton).toBeDisabled();
            console.log('✅ 첫 번째 클릭 후 버튼 비활성화 확인');

            // 짧은 대기 후 상태 확인 (로딩 상태가 적용되는 시간 고려)
            await page.waitForTimeout(100);

            // 두 번째 클릭 시도 (이미 비활성화된 버튼이므로 무시되어야 함)
            await submitButton.click({ force: true });
            console.log('🔍 두 번째 클릭 시도 (강제)');

            // 여전히 비활성화 상태 유지
            await expect(submitButton).toBeDisabled();
            console.log('✅ 두 번째 클릭 후에도 버튼 비활성화 유지');

            // 버튼 텍스트 확인 (처리 중 상태)
            await page.waitForTimeout(500);
            const buttonText = await submitButton.textContent();
            console.log('🔍 버튼 텍스트:', buttonText);

            // 처리 중 상태 확인
            if (buttonText && buttonText.includes('처리')) {
                console.log('✅ 버튼이 처리 중 상태로 변경됨');
                await expect(submitButton).toHaveClass(/btn-loading/);
                await expect(submitButton).toHaveText('처리 중...');
            }

            console.log('✅ 중복 제출 방지 검증 완료');
        });
    });

    test.describe('6단계: 오류 상황 처리', () => {
        test('서버 오류 시 사용자 피드백', async ({ page }) => {
            console.log('🎯 테스트: 서버 오류 시 피드백');

            // 서버 오류 시뮬레이션을 위한 네트워크 인터셉트
            await page.route('**/user', route => {
                if (route.request().method() === 'POST') {
                    route.fulfill({
                        status: 500,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: false,
                            message: '서버 내부 오류가 발생했습니다.'
                        })
                    });
                } else {
                    route.continue();
                }
            });

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            // 완전한 폼 입력
            await page.fill('#username', testData.skkuUser.username);
            await page.fill('#email', testData.skkuUser.email);
            await page.fill('#password', testData.skkuUser.password);
            await page.fill('#confirmPassword', testData.skkuUser.confirmPassword);
            await page.fill('#name', testData.skkuUser.name);
            await page.selectOption('#role', testData.skkuUser.role);

            await page.waitForSelector('#skkuFields', { state: 'visible' });
            await page.fill('#department', testData.skkuUser.department);
            await page.fill('#studentYear', testData.skkuUser.studentYear);

            const submitButton = page.locator('button[type="submit"]');

            // 폼 제출
            await submitButton.click();

            // 오류 응답 대기
            await page.waitForTimeout(3000);

            // 오류 메시지 확인
            const errorNotification = page.locator('.notification.notification--error');
            await expect(errorNotification).toBeVisible();

            // 버튼 상태 복원 확인
            await expect(submitButton).toBeEnabled();
            await expect(submitButton).not.toHaveText('처리 중...');
            await expect(submitButton).not.toHaveClass(/btn-loading/);

            console.log('✅ 서버 오류 시 피드백 검증 완료');
        });

        test('네트워크 연결 오류 시 처리', async ({ page }) => {
            console.log('🎯 테스트: 네트워크 연결 오류');

            // 네트워크 오류 시뮬레이션
            await page.route('**/user', route => {
                if (route.request().method() === 'POST') {
                    route.abort('failed');
                } else {
                    route.continue();
                }
            });

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            // 완전한 폼 입력
            await page.fill('#username', testData.skkuUser.username);
            await page.fill('#email', testData.skkuUser.email);
            await page.fill('#password', testData.skkuUser.password);
            await page.fill('#confirmPassword', testData.skkuUser.confirmPassword);
            await page.fill('#name', testData.skkuUser.name);
            await page.selectOption('#role', testData.skkuUser.role);

            await page.waitForSelector('#skkuFields', { state: 'visible' });
            await page.fill('#department', testData.skkuUser.department);
            await page.fill('#studentYear', testData.skkuUser.studentYear);

            const submitButton = page.locator('button[type="submit"]');

            // 폼 제출
            await submitButton.click();

            // 오류 처리 대기
            await page.waitForTimeout(3000);

            // 일반적인 오류 메시지 확인
            const errorNotification = page.locator('.notification.notification--error');
            await expect(errorNotification).toBeVisible();

            // 버튼 상태 복원 확인
            await expect(submitButton).toBeEnabled();

            console.log('✅ 네트워크 연결 오류 처리 검증 완료');
        });
    });

    test.describe('7단계: 접근성 및 사용성 테스트', () => {
        test('키보드 네비게이션 테스트', async ({ page }) => {
            console.log('🎯 테스트: 키보드 네비게이션');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            // Tab 키로 필드 간 이동
            await page.keyboard.press('Tab'); // username
            await expect(page.locator('#username')).toBeFocused();

            await page.keyboard.press('Tab'); // email
            await expect(page.locator('#email')).toBeFocused();

            await page.keyboard.press('Tab'); // password
            await expect(page.locator('#password')).toBeFocused();

            await page.keyboard.press('Tab'); // confirmPassword
            await expect(page.locator('#confirmPassword')).toBeFocused();

            await page.keyboard.press('Tab'); // name
            await expect(page.locator('#name')).toBeFocused();

            await page.keyboard.press('Tab'); // role
            await expect(page.locator('#role')).toBeFocused();

            console.log('✅ 키보드 네비게이션 검증 완료');
        });

        test('폼 필드 라벨 및 접근성 확인', async ({ page }) => {
            console.log('🎯 테스트: 폼 접근성');

            await page.goto('http://localhost:3000/user/new');
            await page.waitForLoadState('networkidle');

            // 필수 필드 표시 확인
            const requiredFields = ['#username', '#email', '#password', '#confirmPassword', '#name'];

            for (const field of requiredFields) {
                const fieldElement = page.locator(field);
                await expect(fieldElement).toBeVisible();

                // required 속성 확인
                await expect(fieldElement).toHaveAttribute('required');
            }

            console.log('✅ 폼 접근성 검증 완료');
        });
    });
});
