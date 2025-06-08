/**
 * 🎭 Playwright 헤드리스 테스트 설정 - 빠른 테스트용
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // 테스트 디렉토리 - 사용자 행동 테스트만
    testDir: './tests/e2e/auth',

    // 테스트 파일 패턴
    testMatch: '**/*.spec.js',

    // 전역 설정
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,

    // 리포터 설정 - 간단하게
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }]
    ],

    // 전역 설정
    use: {
        // 기본 URL
        baseURL: 'http://localhost:3000',

        // 헤드리스 모드로 빠른 실행
        headless: true,

        // 추적 설정 - 최소화
        trace: 'off',

        // 스크린샷 - 실패 시에만
        screenshot: 'only-on-failure',

        // 비디오 - 비활성화
        video: 'off',

        // 타임아웃 설정
        actionTimeout: 20000,
        navigationTimeout: 20000,

        // 로케일 설정
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul'
    },

    // Chrome만 사용 (빠른 실행)
    projects: [
        {
            name: 'chromium-headless',
            use: {
                ...devices['Desktop Chrome'],
                headless: true
            }
        }
    ],

    // 테스트 타임아웃 - 짧게
    timeout: 30000,
    expect: {
        timeout: 5000
    },

    // 출력 디렉토리
    outputDir: 'test-results/headless'
});
