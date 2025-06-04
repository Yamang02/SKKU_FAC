/**
 * �� Playwright 전역 설정 - 간단한 초기화
 */
import dockerTestSetup from './dockerTestSetup.js';

/**
 * 🚀 전역 설정 - 모든 테스트 실행 전 한 번 실행
 */
async function globalSetup() {
    console.log('🎭 Playwright 전역 설정 시작...');

    try {
        // 데이터베이스 연결 확인 (Docker 컨테이너는 수동으로 시작되어야 함)
        console.log('📊 데이터베이스 연결 확인 중...');

        // 간단한 연결 테스트
        const status = dockerTestSetup.getStatus();
        console.log('📋 현재 상태:', status);

        console.log('✅ Playwright 전역 설정 완료');

    } catch (error) {
        console.error('❌ Playwright 전역 설정 실패:', error);
        // 설정 실패 시에도 테스트 진행 (Docker 컨테이너가 수동으로 시작될 수 있음)
        console.log('⚠️ 설정 실패했지만 테스트 계속 진행...');
    }
}

export default globalSetup;
