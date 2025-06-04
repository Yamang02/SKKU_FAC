/**
 * 🎭 Playwright 전역 정리 - Docker 환경 정리
 */
import dockerTestSetup from './dockerTestSetup.js';

/**
 * 🧹 전역 정리 - 모든 테스트 실행 후 한 번 실행
 */
async function globalTeardown() {
    console.log('🎭 Playwright 전역 정리 시작...');

    try {
        // 테스트 데이터 정리
        await dockerTestSetup.cleanupTestData();

        // Docker 테스트 환경 정리
        await dockerTestSetup.stopTestEnvironment();

        console.log('✅ Playwright 전역 정리 완료');

    } catch (error) {
        console.error('⚠️ Playwright 전역 정리 중 오류:', error);
        // 정리 과정에서 오류가 발생해도 테스트는 계속 진행
    }
}

export default globalTeardown;
