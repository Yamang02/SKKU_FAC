/**
 * 🎭 Playwright 설정 - Docker 기반 개발환경용 E2E 테스트
 */
import { defineConfig, devices } from '@playwright/test';

// 환경 감지
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
const isHeadless = process.env.HEADLESS !== 'false';

// 디버깅을 위한 URL 결정
const baseURL = isRailway
    ? `https://${process.env.PUBLIC_DOMAIN}`
    : process.env.TEST_BASE_URL || 'http://localhost:3001'; // 로컬 테스트 환경용 포트 (test-env 컨테이너)

console.log('🔍 Playwright 환경 설정:');
console.log('  - isRailway:', isRailway);
console.log('  - PUBLIC_DOMAIN:', process.env.PUBLIC_DOMAIN);
console.log('  - RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('  - baseURL:', baseURL);

export default defineConfig({
    // 테스트 디렉토리 - 전체 E2E 테스트
    testDir: './tests/e2e',

    // 테스트 파일 패턴
    testMatch: '**/*.spec.js',

    // 글로벌 설정
    globalSetup: './tests/globalSetup.js',

    // 전역 설정
    fullyParallel: false, // Docker/Railway 환경에서는 순차 실행이 안전
    forbidOnly: !!process.env.CI,
    retries: isRailway ? 2 : (process.env.CI ? 1 : 0),
    workers: 1, // 단일 워커로 안정적 실행

    // 리포터 설정
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }]
    ],

    // 전역 설정
    use: {
        // URL 자동 감지: Railway > Local Test
        baseURL: baseURL,

        // 추적 설정
        trace: 'on-first-retry',

        // 스크린샷 (실패 시에만)
        screenshot: 'only-on-failure',

        // 비디오 (실패 시에만)
        video: 'retain-on-failure',

        // 헤드리스 모드 설정
        headless: isHeadless,

        // 환경별 타임아웃 설정
        actionTimeout: isRailway ? 45000 : 30000,
        navigationTimeout: isRailway ? 45000 : 30000,

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
                // 환경별 Chrome 설정
                launchOptions: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor',
                        '--no-first-run',
                        ...(isRailway ? ['--disable-gpu'] : ['--disable-extensions'])
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

    // 환경별 타임아웃
    timeout: isRailway ? 90000 : 60000,
    expect: {
        timeout: isRailway ? 15000 : 10000
    },

    // 출력 디렉토리
    outputDir: 'test-results/screenshots'
});
