/**
 * 🔍 Playwright 글로벌 설정 - 테스트 환경 검증
 */
import { request } from '@playwright/test';

async function globalSetup() {
    console.log('\n🔍 테스트 환경 검증 시작...');

    // 1. 3001 포트 연결 테스트
    console.log('📡 3001 포트 연결 상태 확인...');
    try {
        const apiRequestContext = await request.newContext();
        const response = await apiRequestContext.get('http://localhost:3001', {
            timeout: 10000
        });

        if (response.ok()) {
            console.log('✅ 3001 포트 연결 성공!');
            console.log(`   - 상태: ${response.status()}`);
            console.log('   - URL: http://localhost:3001');
        } else {
            console.log(`⚠️ 3001 포트 응답 오류: ${response.status()}`);
        }

        await apiRequestContext.dispose();
    } catch (error) {
        console.error('❌ 3001 포트 연결 실패:', error.message);
        console.log('🔧 가능한 해결책:');
        console.log('   1. test-env 컨테이너가 실행 중인지 확인');
        console.log('   2. docker-compose up -d test-env 실행');
        console.log('   3. 포트 3001이 다른 프로세스에서 사용 중인지 확인');

        // 3000 포트도 테스트해보기
        console.log('\n📡 3000 포트 연결 상태 확인 (개발용)...');
        try {
            const apiRequestContext2 = await request.newContext();
            const response2 = await apiRequestContext2.get('http://localhost:3000', {
                timeout: 5000
            });

            if (response2.ok()) {
                console.log('✅ 3000 포트는 연결 가능함 (개발 환경)');
                console.log('⚠️ 테스트가 개발 DB(3307)를 사용할 수 있습니다!');
            }

            await apiRequestContext2.dispose();
        } catch (error2) {
            console.log('❌ 3000 포트도 연결 불가');
        }
    }

    console.log('🔍 테스트 환경 검증 완료\n');
}

export default globalSetup;
