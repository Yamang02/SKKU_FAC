import { defineConfig, devices } from '@playwright/test';

/**
 * 통합 테스트용 Playwright 설정
 * 웹서버를 실행하여 실제 HTTP 요청을 테스트합니다.
 */
const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './tests/integration',
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
    /* 통합 테스트용 설정 */
    use: {
        /* 기본 URL */
        baseURL: 'http://localhost:3000',
        /* 실패 시 스크린샷 수집 */
        screenshot: 'only-on-failure',
        /* 실패 시 비디오 수집 */
        video: 'retain-on-failure',
        /* 실패 시 trace 수집 */
        trace: 'on-first-retry',
    },

    /* Chrome만 사용 */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* 로컬 개발 서버 실행 */
    webServer: {
        command: 'npm run start:test',
        url: 'http://localhost:3000',
        reuseExistingServer: !isCI,
        timeout: 120 * 1000,
    },
});
