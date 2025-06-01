/**
 * Railway 환경 전용 글로벌 테스트 정리
 * ephemeral 파일시스템에서 테스트 후 정리 작업
 */

async function globalTeardown() {
    console.log('🧹 Railway 테스트 환경 정리 시작...');

    try {
        // Railway 환경에서는 파일 정리가 자동으로 되므로 최소한의 작업만 수행

        // 테스트 결과 요약 출력
        console.log('📊 테스트 완료 요약:');
        console.log(`- 테스트 환경: Railway (${process.env.RAILWAY_TEST_URL})`);
        console.log(`- 실행 시간: ${new Date().toISOString()}`);

        // 메모리 사용량 정리 (Railway 리소스 최적화)
        if (global.gc) {
            global.gc();
            console.log('🗑️ 메모리 가비지 컬렉션 실행');
        }

        console.log('✅ Railway 테스트 환경 정리 완료');

    } catch (error) {
        console.error('❌ Railway 테스트 정리 중 오류:', error.message);
        // 정리 작업 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
}

export default globalTeardown;
