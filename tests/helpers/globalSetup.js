/**
 * Railway 환경 전용 글로벌 테스트 설정
 * ephemeral 파일시스템에 최적화된 설정
 */

import { chromium } from '@playwright/test';

async function globalSetup() {
    console.log('🚀 Railway 테스트 환경 설정 시작...');

    // Railway 환경 변수 확인
    const railwayUrl = process.env.RAILWAY_TEST_URL;
    if (!railwayUrl) {
        throw new Error('RAILWAY_TEST_URL 환경변수가 설정되지 않았습니다.');
    }

    console.log(`📡 테스트 대상 URL: ${railwayUrl}`);

    // Railway 서버 상태 확인
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('🔍 Railway 서버 상태 확인 중...');

        // 헬스체크 엔드포인트 확인
        const response = await page.goto(`${railwayUrl}/health`, {
            waitUntil: 'networkidle',
            timeout: 60000,
        });

        if (!response.ok()) {
            throw new Error(`Railway 서버가 응답하지 않습니다. Status: ${response.status()}`);
        }

        console.log('✅ Railway 서버 상태 정상');

        // 기본 페이지 로드 테스트
        await page.goto(railwayUrl, {
            waitUntil: 'networkidle',
            timeout: 60000,
        });

        console.log('✅ 기본 페이지 로드 성공');
    } catch (error) {
        console.error('❌ Railway 서버 상태 확인 실패:', error.message);
        throw error;
    } finally {
        await browser.close();
    }

    // Railway 환경에서 필요한 추가 설정
    process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'; // 브라우저 다운로드 스킵
    process.env.PLAYWRIGHT_BROWSERS_PATH = '0'; // 시스템 브라우저 사용

    console.log('🎯 Railway 테스트 환경 설정 완료');
}

export default globalSetup;
