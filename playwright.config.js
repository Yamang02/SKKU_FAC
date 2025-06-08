/**
 * 🎭 Playwright 설정 - 로컬 개발환경용 사용자 행동 테스트
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // 테스트 디렉토리 - 사용자 행동 테스트만
    testDir: './tests/e2e/auth',

    // 테스트 파일 패턴
    testMatch: '**/*.spec.js',

    // 전역 설정
    fullyParallel: false, // 사용자 행동 테스트는 순차 실행이 안전
    forbidOnly: !!process.env.CI, // CI에서는 .only() 금지
    retries: process.env.CI ? 1 : 0, // CI에서만 재시도
    workers: 1, // 단일 워커로 안정적 실행

    // 리포터 설정
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }]
    ],

    // 전역 설정
    use: {
        // 기본 URL - 로컬 개발 서버
        baseURL: 'http://localhost:3000',

        // 추적 설정 (실패 시에만)
        trace: 'on-first-retry',

        // 스크린샷 (실패 시에만)
        screenshot: 'only-on-failure',

        // 비디오 (실패 시에만)
        video: 'retain-on-failure',

        // 로컬 개발환경에서는 브라우저 UI 표시
        headless: process.env.CI ? true : false,

        // 타임아웃 설정
        actionTimeout: 30000,
        navigationTimeout: 30000,

        // 로케일 설정
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',

        // 캐시 무시 설정
        extraHTTPHeaders: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    },

    // 브라우저별 프로젝트 설정
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Chrome 개발자 도구 사용 가능
                launchOptions: {
                    args: [
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding',
                        '--no-first-run',
                        '--disable-extensions'
                    ]
                },
                // 브라우저 컨텍스트 초기화
                contextOptions: {
                    clearCookies: true,
                    clearLocalStorage: true
                }
            }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        }
    ],

    // 테스트 타임아웃
    timeout: 60000, // 60초
    expect: {
        timeout: 10000 // expect 타임아웃 10초
    },

    // 출력 디렉토리
    outputDir: 'test-results/screenshots'
});
