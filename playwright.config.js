import { defineConfig, devices } from '@playwright/test';

/**
 * 환경별 설정
 */
const isCI = !!process.env.CI;
const testEnvironment = process.env.TEST_ENVIRONMENT || 'local';

// 환경별 baseURL 설정
const getBaseURL = () => {
    switch (testEnvironment) {
        case 'local':
        default:
            return 'http://localhost:3000';
    }
};

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',
    /* 병렬 테스트 실행 */
    fullyParallel: true,
    /* CI에서 실패 시 재시도 비활성화 */
    forbidOnly: !!isCI,
    /* CI에서 재시도 비활성화 */
    retries: isCI ? 2 : 0,
    /* 로컬에서는 병렬 실행, CI에서는 순차 실행 */
    workers: isCI ? 1 : undefined,
    /* 리포터 설정 */
    reporter: 'html',
    /* 모든 프로젝트에 공통으로 적용되는 설정 */
    use: {
        /* 기본 URL */
        baseURL: getBaseURL(),
        /* 실패 시 스크린샷 수집 */
        screenshot: 'only-on-failure',
        /* 실패 시 비디오 수집 */
        video: 'retain-on-failure',
        /* 실패 시 trace 수집 */
        trace: 'on-first-retry'
    },

    /* 프로젝트별 설정 - Chrome만 사용 */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],

    /* 로컬 개발 서버 실행 */
    webServer: {
        command: 'npm run start:test',
        url: 'http://localhost:3000',
        reuseExistingServer: !isCI,
        timeout: 120 * 1000
    }
});
