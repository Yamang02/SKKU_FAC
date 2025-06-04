/**
 * 🎭 Playwright 설정 - Docker 기반 통합 테스트
 */
import { defineConfig, devices } from '@playwright/test';

/**
 * 환경별 설정
 */
const config = {
    // 테스트 환경 설정
    testEnvironment: {
        baseURL: 'http://localhost:3000',
        mysql: {
            host: 'localhost',
            port: 3307, // 테스트용 MySQL 포트
            user: 'root',
            password: 'testpassword',
            database: 'skku_sfa_gallery_test',
        },
        redis: {
            url: 'redis://localhost:6380', // 테스트용 Redis 포트
        },
    },
};

export default defineConfig({
    // 테스트 디렉토리
    testDir: './tests/integration',

    // 테스트 파일 패턴
    testMatch: '**/*.test.js',

    // 전역 설정
    fullyParallel: false, // Docker 환경에서는 순차 실행이 안전
    forbidOnly: !!process.env.CI, // CI에서는 .only() 금지
    retries: process.env.CI ? 2 : 0, // CI에서만 재시도
    workers: process.env.CI ? 1 : 1, // Docker 환경에서는 단일 워커 사용

    // 리포터 설정
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list'],
    ],

    // 전역 설정
    use: {
        // 기본 URL
        baseURL: config.testEnvironment.baseURL,

        // 추적 설정 (실패 시에만)
        trace: 'on-first-retry',

        // 스크린샷 (실패 시에만)
        screenshot: 'only-on-failure',

        // 비디오 (실패 시에만)
        video: 'retain-on-failure',

        // API 테스트 설정
        extraHTTPHeaders: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },

        // 타임아웃 설정
        actionTimeout: 30000,
        navigationTimeout: 30000,
    },

    // 프로젝트별 설정
    projects: [
        {
            name: 'api-tests',
            testDir: './tests/integration/api',
            use: {
                ...devices['Desktop Chrome'],
                // API 테스트는 헤드리스 모드
                headless: true,
            },
        },
        {
            name: 'e2e-tests',
            testDir: './tests/integration/e2e',
            use: {
                ...devices['Desktop Chrome'],
                // E2E 테스트는 브라우저 필요
                headless: process.env.CI ? true : false,
            },
            dependencies: ['api-tests'], // API 테스트 후 E2E 실행
        },
    ],

    // 전역 설정 (webServer 제거 - 수동으로 서버 실행)
    globalSetup: './tests/integration/helpers/globalSetup.js',
    globalTeardown: './tests/integration/helpers/globalTeardown.js',

    // 테스트 타임아웃
    timeout: 60000, // 60초
    expect: {
        timeout: 10000, // expect 타임아웃 10초
    },

    // 출력 디렉토리
    outputDir: 'test-results/artifacts',

    // 환경 변수 전달
    metadata: {
        testEnvironment: config.testEnvironment,
    },
});

// 환경별 설정 내보내기
export { config };
