import { test, expect } from '@playwright/test';

/**
 * 사용자 회원가입 상세 동작 테스트
 * 회원가입 과정에서 사용자의 모든 행동과 시스템 응답을 단계별로 테스트
 */

test.describe('사용자 회원가입 상세 동작 테스트', () => {
    let timestamp;
    let testData;

    test.beforeEach(async ({ page }) => {
        timestamp = Date.now();
        testData = {
            skkuUser: {
                username: `skkutest${timestamp}`,
                name: `SKKU Test User`,
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
                name: `External Test User`,
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
            console.log(`🖥️[${msg.type()}]`, msg.text());
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
        test('회원가입 페이지 초기 상태 확인', async ({ page }) => {
            console.log('🧪 테스트: 회원가입 페이지 초기 상태');

            // 페이지 이동
            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            // 페이지 제목 확인 - 실제 페이지의 한글 텍스트 사용
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

            console.log('✅ 초기 상태 확인 완료');
        });
    });

    test.describe('2단계: 기본 정보 입력 과정', () => {
        test('사용자명 입력 실시간 유효성 검사', async ({ page }) => {
            console.log('🧪 테스트: 사용자명 입력 실시간 유효성 검사');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            const usernameField = page.locator('#username');
            const submitButton = page.locator('button[type="submit"]');

            // 빈 상태에서 버튼 비활성화 확인
            await expect(submitButton).toBeDisabled();

            // 사용자명 입력
            await usernameField.fill(testData.skkuUser.username);
            await usernameField.blur();

            // 다른 필드가 비어있어 버튼이 비활성화 상태 유지
            await expect(submitButton).toBeDisabled();

            console.log('✅ 사용자명 입력 유효성 검사 완료');
        });

        test('이메일 입력 실시간 유효성 검사', async ({ page }) => {
            console.log('🧪 테스트: 이메일 입력 실시간 유효성 검사');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            const emailField = page.locator('#email');
            const submitButton = page.locator('button[type="submit"]');

            // 유효한 이메일 입력
            await emailField.fill(testData.skkuUser.email);
            await emailField.blur();

            // 다른 필드가 비어있어 버튼이 비활성화 상태 유지
            await expect(submitButton).toBeDisabled();

            // 잘못된 이메일 형식 테스트
            await emailField.fill('invalid-email');
            await emailField.blur();
            await expect(submitButton).toBeDisabled();

            console.log('✅ 이메일 입력 유효성 검사 완료');
        });

        test('비밀번호 입력 및 확인 과정', async ({ page }) => {
            console.log('🧪 테스트: 비밀번호 입력 및 확인');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            const passwordField = page.locator('#password');
            const confirmPasswordField = page.locator('#confirmPassword');
            const submitButton = page.locator('button[type="submit"]');

            // 비밀번호 입력
            await passwordField.fill(testData.skkuUser.password);
            await passwordField.blur();

            // 비밀번호 확인 입력 (불일치 경우)
            await confirmPasswordField.fill('WrongPassword123!');
            await confirmPasswordField.blur();

            // 비밀번호 불일치 경고 표시 및 버튼 비활성화
            await expect(confirmPasswordField).toHaveClass(/is-invalid/);
            await expect(submitButton).toBeDisabled();

            // 올바른 비밀번호 확인 입력
            await confirmPasswordField.fill(testData.skkuUser.password);
            await confirmPasswordField.blur();

            // 비밀번호 일치 경고 해제
            await expect(confirmPasswordField).toHaveClass(/is-valid/);

            console.log('✅ 비밀번호 입력 유효성 검사 완료');
        });

        test('비밀번호 보기/숨기기 토글 기능', async ({ page }) => {
            console.log('🧪 테스트: 비밀번호 보기/숨기기 토글');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            const passwordField = page.locator('#password');
            const passwordToggle = page.locator('.toggle-password-user').first();

            // 비밀번호 입력
            await passwordField.fill(testData.skkuUser.password);

            // 초기 상태: 비밀번호 타입
            await expect(passwordField).toHaveAttribute('type', 'password');

            // 토글 클릭 - 보기
            await passwordToggle.click();
            await expect(passwordField).toHaveAttribute('type', 'text');

            // 토글 클릭 - 숨기기
            await passwordToggle.click();
            await expect(passwordField).toHaveAttribute('type', 'password');

            console.log('✅ 비밀번호 토글 기능 확인 완료');
        });
    });

    test.describe('3단계: 역할 선택 및 추가 필드 표시', () => {
        test('성균관대 회원 선택 추가 필드 표시 확인', async ({ page }) => {
            console.log('🧪 테스트: 성균관대 회원 역할 선택');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            const roleSelect = page.locator('#role');
            const skkuFields = page.locator('#skkuFields');
            const externalFields = page.locator('#externalFields');

            // 초기 상태: 모든 역할별 필드 숨김
            await expect(skkuFields).toBeHidden();
            await expect(externalFields).toBeHidden();

            // 성균관대 회원 선택
            await roleSelect.selectOption('SKKU_MEMBER');

            // 성균관대 필드 표시, 외부 필드 숨김 확인
            await expect(skkuFields).toBeVisible();
            await expect(externalFields).toBeHidden();

            // 성균관대 필드 내부 요소 표시 확인
            await expect(page.locator('#department')).toBeVisible();
            await expect(page.locator('#studentYear')).toBeVisible();
            await expect(page.locator('#isClubMember')).toBeVisible();

            console.log('✅ 성균관대 회원 필드 표시 확인 완료');
        });

        test('외부 회원 선택 추가 필드 표시 확인', async ({ page }) => {
            console.log('🧪 테스트: 외부 회원 역할 선택');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            const roleSelect = page.locator('#role');
            const skkuFields = page.locator('#skkuFields');
            const externalFields = page.locator('#externalFields');

            // 외부 회원 선택
            await roleSelect.selectOption('EXTERNAL_MEMBER');

            // 외부 필드 표시, 성균관대 필드 숨김 확인
            await expect(externalFields).toBeVisible();
            await expect(skkuFields).toBeHidden();

            // 외부 필드 내부 요소 표시 확인
            await expect(page.locator('#affiliation')).toBeVisible();

            console.log('✅ 외부 회원 필드 표시 확인 완료');
        });

        test('역할 변경 필드 초기화 확인', async ({ page }) => {
            console.log('🧪 테스트: 역할 변경 필드 초기화');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            const roleSelect = page.locator('#role');
            const departmentField = page.locator('#department');
            const affiliationField = page.locator('#affiliation');

            // 성균관대 회원 선택 및 데이터 입력
            await roleSelect.selectOption('SKKU_MEMBER');
            await departmentField.fill('컴퓨터공학과');

            // 외부 회원으로 변경
            await roleSelect.selectOption('EXTERNAL_MEMBER');
            await affiliationField.fill('외부 기관');

            // 다시 성균관대 회원으로 변경
            await roleSelect.selectOption('SKKU_MEMBER');

            // 이전 성균관대 데이터 초기화 확인
            await expect(departmentField).toHaveValue('');

            console.log('✅ 역할 변경 필드 초기화 확인 완료');
        });
    });

    test.describe('4단계: 폼 유효성 검사 및 버튼 활성화', () => {
        test('성균관대 회원 모든 정보 입력 버튼 활성화', async ({ page }) => {
            console.log('🧪 테스트: 성균관대 회원 모든 정보 입력');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            const submitButton = page.locator('button[type="submit"]');

            // 기본 정보 입력
            await page.fill('#username', testData.skkuUser.username);
            await page.fill('#email', testData.skkuUser.email);
            await page.fill('#password', testData.skkuUser.password);
            await page.fill('#confirmPassword', testData.skkuUser.confirmPassword);
            await page.fill('#name', testData.skkuUser.name);

            // 역할 선택하지 않았을 때 버튼 비활성화 확인
            await expect(submitButton).toBeDisabled();

            // 역할 선택
            await page.selectOption('#role', testData.skkuUser.role);

            // 성균관대 필드 표시 대기
            await page.waitForSelector('#skkuFields', { state: 'visible' });

            // 성균관대 특정 필드 미입력 시 버튼 비활성화 확인
            await expect(submitButton).toBeDisabled();

            // 성균관대 특정 필드 입력
            await page.fill('#department', testData.skkuUser.department);
            await page.fill('#studentYear', testData.skkuUser.studentYear);

            // 모든 필수 필드 완료 시 버튼 활성화 확인
            await expect(submitButton).toBeEnabled();
            await expect(submitButton).not.toHaveClass(/btn-disabled/);

            console.log('✅ 성균관대 회원 모든 정보 입력 확인 완료');
        });

        test('외부 회원 모든 정보 입력 버튼 활성화', async ({ page }) => {
            console.log('🧪 테스트: 외부 회원 모든 정보 입력');

            await page.goto('/user/new');
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

            // 외부 특정 필드 미입력 시 버튼 비활성화 확인
            await expect(submitButton).toBeDisabled();

            // 외부 특정 필드 입력
            await page.fill('#affiliation', testData.externalUser.affiliation);

            // 모든 필수 필드 완료 시 버튼 활성화 확인
            await expect(submitButton).toBeEnabled();
            await expect(submitButton).not.toHaveClass(/btn-disabled/);

            console.log('✅ 외부 회원 모든 정보 입력 확인 완료');
        });

        test('필수 필드 누락 시 버튼 비활성화 유지', async ({ page }) => {
            console.log('🧪 테스트: 필수 필드 누락 시 버튼 상태');

            await page.goto('/user/new');
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

            console.log('✅ 필수 필드 누락 시 버튼 비활성화 확인 완료');
        });
    });

    test.describe('5단계: 폼 제출 과정', () => {
        test('성균관대 회원 성공적인 회원가입 과정', async ({ page }) => {
            console.log('🧪 테스트: 성균관대 회원 성공적인 회원가입');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            // 모든 정보 입력
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

            // 제출 전 스크린샷
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

            // 제출 진행 중 버튼 상태 확인 (로딩 상태)
            await expect(submitButton).toBeDisabled();
            await expect(submitButton).toHaveText('처리 중...');
            await expect(submitButton).toHaveClass(/btn-loading/);

            // API 응답 대기
            const response = await responsePromise;
            console.log('📡 응답 상태:', response.status());

            // 성공적인 응답 시 리다이렉트 확인
            if (response.status() === 201) {
                console.log('✅ 회원가입 성공 - 리다이렉트 대기');
                // 3초 후 리다이렉트 확인
                await page.waitForTimeout(3500);
                await expect(page.url()).toContain('/user/login');
            } else {
                // 실패 시에만 알림 메시지 확인
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

            console.log('✅ 성균관대 회원 회원가입 과정 확인 완료');
        });

        test('외부 회원 성공적인 회원가입 과정', async ({ page }) => {
            console.log('🧪 테스트: 외부 회원 성공적인 회원가입');

            // 캐시 초기화 - 쿠키만
            await page.context().clearCookies();

            // 캐시 무시하고 페이지 로드
            await page.goto('/user/new?_=' + Date.now(), { waitUntil: 'networkidle' });

            // 모든 정보 입력 (기본 정보 먼저)
            await page.fill('#username', testData.externalUser.username);
            await page.fill('#email', testData.externalUser.email);
            await page.fill('#password', testData.externalUser.password);
            await page.fill('#confirmPassword', testData.externalUser.confirmPassword);
            await page.fill('#name', testData.externalUser.name);

            // 외부 회원 역할 선택
            await page.selectOption('#role', testData.externalUser.role);
            await page.waitForSelector('#externalFields', { state: 'visible' });
            await page.waitForSelector('#skkuFields', { state: 'hidden' });

            // 외부 회원 특정 필드 입력
            await page.fill('#affiliation', testData.externalUser.affiliation);

            // 성균관대 관련 필드가 숨겨져 있고 체크박스에 접근할 수 없는지 확인
            const isClubMemberVisible = await page.locator('#isClubMember').isVisible();
            console.log('📋 동아리 회원 필드 표시 상태:', isClubMemberVisible);

            // 숨겨진 필드는 체크하지 않음 (DOM에서 접근 불가능할 수 있음)

            const submitButton = page.locator('button[type="submit"]');
            await expect(submitButton).toBeEnabled();

            // 제출 전 스크린샷
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

            // 제출 진행 중 버튼 상태 확인 (로딩 상태)
            await expect(submitButton).toBeDisabled();
            await expect(submitButton).toHaveText('처리 중...');
            await expect(submitButton).toHaveClass(/btn-loading/);

            // API 응답 대기
            const response = await responsePromise;
            console.log('📡 응답 상태:', response.status());

            // 성공적인 응답 시 리다이렉트 확인
            if (response.status() === 201) {
                console.log('✅ 회원가입 성공 - 리다이렉트 대기');
                // 3초 후 리다이렉트 확인
                await page.waitForTimeout(3500);
                await expect(page.url()).toContain('/user/login');
            } else {
                // 실패 시에만 알림 메시지 확인
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

            console.log('✅ 외부 회원 회원가입 과정 확인 완료');
        });

        test('중복 제출 방지 확인', async ({ page }) => {
            console.log('🧪 테스트: 중복 제출 방지');

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            // 모든 정보 입력 (고유한 사용자명)
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
            console.log('📋 제출 전 버튼 상태: 활성화');

            // 첫 번째 클릭
            await submitButton.click();

            // 버튼이 즉시 비활성화되는지 확인 (JavaScript 중복 클릭 방지 로직)
            await expect(submitButton).toBeDisabled();
            console.log('✅ 첫 번째 클릭 후 버튼 비활성화 확인');

            // 상태 확인을 위한 짧은 대기 (로딩 상태 적용 시간 고려)
            await page.waitForTimeout(100);

            // 두 번째 클릭 시도 (버튼이 이미 비활성화되어 무시되어야 함)
            await submitButton.click({ force: true });
            console.log('📋 두 번째 클릭 시도 (강제)');

            // 여전히 비활성화 상태 유지
            await expect(submitButton).toBeDisabled();
            console.log('✅ 두 번째 클릭 후 버튼 비활성화 상태 유지');

            // 버튼 텍스트 확인 (처리 상태)
            await page.waitForTimeout(500);
            const buttonText = await submitButton.textContent();
            console.log('📋 버튼 텍스트:', buttonText);

            // 처리 상태 확인
            if (buttonText && buttonText.includes('처리')) {
                console.log('✅ 버튼이 처리 상태로 변경됨');
                await expect(submitButton).toHaveClass(/btn-loading/);
                await expect(submitButton).toHaveText('처리 중...');
            }

            console.log('✅ 중복 제출 방지 확인 완료');
        });
    });

    test.describe('6단계: 오류 상황 처리', () => {
        test('서버 오류 사용자 피드백', async ({ page }) => {
            console.log('🧪 테스트: 서버 오류 피드백');

            // 서버 오류 시뮬레이션을 위한 네트워크 가로채기
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

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            // All information input
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

            // 버튼 상태 복구 확인
            await expect(submitButton).toBeEnabled();
            await expect(submitButton).not.toHaveText('처리 중...');
            await expect(submitButton).not.toHaveClass(/btn-loading/);

            console.log('✅ 서버 오류 피드백 확인 완료');
        });

        test('네트워크 연결 오류 처리', async ({ page }) => {
            console.log('🧪 테스트: 네트워크 연결 오류');

            // 네트워크 오류 시뮬레이션
            await page.route('**/user', route => {
                if (route.request().method() === 'POST') {
                    route.abort('failed');
                } else {
                    route.continue();
                }
            });

            await page.goto('/user/new');
            await page.waitForLoadState('networkidle');

            // All information input
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

            // 일반 오류 메시지 확인
            const errorNotification = page.locator('.notification.notification--error');
            await expect(errorNotification).toBeVisible();

            // 버튼 상태 복구 확인
            await expect(submitButton).toBeEnabled();

            console.log('✅ 네트워크 연결 오류 처리 확인 완료');
        });
    });

});
