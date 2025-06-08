/**
 * 🎭 Playwright 로컬 테스트 설정 - 환경 확인 없이 실행
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // 테스트 디렉토리
    testDir: './tests/e2e',

    // 테스트 파일 패턴
    testMatch: '**/*.spec.js',

    // 전역 설정
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,

    // 리포터 설정
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list']
    ],

    // 전역 설정
    use: {
        // 기본 URL
        baseURL: 'http://localhost:3000',

        // 추적 설정
        trace: 'on-first-retry',

        // 스크린샷
        screenshot: 'only-on-failure',

        // 비디오
        video: 'retain-on-failure',

        // 타임아웃 설정
        actionTimeout: 30000,
        navigationTimeout: 30000
    },

    // 프로젝트별 설정
    projects: [
        {
            name: 'e2e-local',
            testDir: './tests/e2e',
            testMatch: '**/*.spec.js',
            use: {
                ...devices['Desktop Chrome'],
                headless: false
            }
        }
    ],

    // 전역 설정 없음 (환경 확인 건너뛰기)
    // globalSetup: './tests/integration/helpers/globalSetup.js',
    // globalTeardown: './tests/integration/helpers/globalTeardown.js',

    // 테스트 타임아웃
    timeout: 60000,
    expect: {
        timeout: 10000
    },

    // 출력 디렉토리
    outputDir: 'test-results/artifacts'
});
