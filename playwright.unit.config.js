import { defineConfig, devices } from '@playwright/test';

/**
 * 단위 테스트용 Playwright 설정
 * 웹서버 없이 실행되어 포트 충돌을 방지합니다.
 */
export default defineConfig({
    testDir: './tests/unit',
    /* 병렬 테스트 실행 */
    fullyParallel: true,
    /* 재시도 비활성화 */
    retries: 0,
    /* 병렬 실행 */
    workers: undefined,
    /* 리포터 설정 */
    reporter: 'html',
    /* 단위 테스트용 설정 */
    use: {
        /* 단위 테스트는 브라우저가 필요하지 않음 */
        headless: true,
        /* 실패 시 스크린샷 비활성화 */
        screenshot: 'off',
        /* 실패 시 비디오 비활성화 */
        video: 'off',
        /* trace 비활성화 */
        trace: 'off'
    },

    /* Chrome만 사용 */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ]

    /* 웹서버 설정 없음 - 단위 테스트는 서버가 필요하지 않음 */
});
