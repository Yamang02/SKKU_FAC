#!/usr/bin/env node

/**
 * 환경변수 진단 스크립트
 * Railway 테스트 환경에서 환경변수 설정을 확인합니다.
 */

console.log('🔍 환경변수 진단 시작...\n');

// 기본 환경 정보
console.log('=== 기본 환경 정보 ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`PORT: ${process.env.PORT || 'undefined'}`);
console.log(`RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || 'undefined'}`);
console.log(`RAILWAY_PROJECT_NAME: ${process.env.RAILWAY_PROJECT_NAME || 'undefined'}`);
console.log(`RAILWAY_SERVICE_NAME: ${process.env.RAILWAY_SERVICE_NAME || 'undefined'}\n`);

// 🔐 암호화 관련 설정 (중요!)
console.log('=== 🔐 암호화 설정 (중요!) ===');
console.log(`CONFIG_MASTER_KEY: ${process.env.CONFIG_MASTER_KEY ? `설정됨 (${process.env.CONFIG_MASTER_KEY.length}자)` : '❌ 누락!'}`);
if (process.env.CONFIG_MASTER_KEY && process.env.CONFIG_MASTER_KEY.length < 32) {
    console.log('⚠️  CONFIG_MASTER_KEY가 32자 미만입니다. 최소 32자 필요!');
}
if (!process.env.CONFIG_MASTER_KEY) {
    console.log('❌ CONFIG_MASTER_KEY가 없으면 이전에 암호화된 환경변수들을 복호화할 수 없습니다!');
}
console.log('');

// Redis 설정
console.log('=== Redis 설정 ===');
console.log(`REDIS_URL: ${process.env.REDIS_URL ? process.env.REDIS_URL.replace(/:[^@]*@/, ':***@') : 'undefined'}`);
console.log(`REDIS_HOST: ${process.env.REDIS_HOST || 'undefined'}`);
console.log(`REDIS_PORT: ${process.env.REDIS_PORT || 'undefined'}`);
console.log(`REDIS_USERNAME: ${process.env.REDIS_USERNAME ? '***' : 'undefined'}`);
console.log(`REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? '***' : 'undefined'}`);
console.log(`REDIS_DB: ${process.env.REDIS_DB || 'undefined'}\n`);

// 데이터베이스 설정
console.log('=== 데이터베이스 설정 ===');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^@]*@/, ':***@') : 'undefined'}`);
console.log(`DB_HOST: ${process.env.DB_HOST || 'undefined'}`);
console.log(`DB_PORT: ${process.env.DB_PORT || 'undefined'}`);
console.log(`DB_NAME: ${process.env.DB_NAME || 'undefined'}`);
console.log(`DB_USER: ${process.env.DB_USER || 'undefined'}`);
console.log(`DB_PASS: ${process.env.DB_PASS ? '***' : 'undefined'}\n`);

// 이메일 설정
console.log('=== 이메일 설정 ===');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'undefined'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***' : 'undefined'}`);
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'undefined'}`);
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'undefined'}\n`);

// 보안 설정
console.log('=== 보안 설정 ===');
console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET ? '***' : 'undefined'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '***' : 'undefined'}`);
console.log(`JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? '***' : 'undefined'}\n`);

// Cloudinary 설정
console.log('=== Cloudinary 설정 ===');
console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || 'undefined'}`);
console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '***' : 'undefined'}`);
console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '***' : 'undefined'}\n`);

// 암호화 상태 테스트
console.log('=== 🔐 암호화 상태 테스트 ===');
if (process.env.CONFIG_MASTER_KEY) {
    try {
        // Config 클래스를 로드해서 테스트
        const { default: Config } = await import('../src/config/Config.js');
        const config = Config.getInstance();

        console.log('✅ Config 클래스 로드 성공');

        // 민감한 환경변수들 테스트
        const testKeys = ['email.pass', 'database.password', 'session.secret'];

        for (const key of testKeys) {
            try {
                const value = config.get(key);
                if (value) {
                    console.log(`✅ ${key}: 복호화 성공`);
                } else {
                    console.log(`⚠️  ${key}: 값이 없음`);
                }
            } catch (error) {
                console.log(`❌ ${key}: 복호화 실패 - ${error.message}`);
            }
        }
    } catch (error) {
        console.log(`❌ Config 테스트 실패: ${error.message}`);
    }
} else {
    console.log('❌ CONFIG_MASTER_KEY가 없어 암호화 상태를 테스트할 수 없습니다.');
}
console.log('');

// 연결 테스트
console.log('=== 연결 테스트 ===');

// Redis 연결 테스트
if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT)) {
    console.log('✅ Redis 환경변수 설정됨');
} else {
    console.log('❌ Redis 환경변수 누락');
}

// 데이터베이스 연결 테스트
if (process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASS)) {
    console.log('✅ 데이터베이스 환경변수 설정됨');
} else {
    console.log('❌ 데이터베이스 환경변수 누락');
}

// 이메일 연결 테스트
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('✅ 이메일 환경변수 설정됨');

    // Gmail 앱 비밀번호 형식 확인
    if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.length === 16) {
        console.log('✅ EMAIL_PASS가 16자리 (Gmail 앱 비밀번호 형식)');
    } else {
        console.log('⚠️  EMAIL_PASS가 16자리가 아님 (Gmail 앱 비밀번호 필요)');
    }
} else {
    console.log('❌ 이메일 환경변수 누락');
}

console.log('\n🔍 환경변수 진단 완료');

// Railway 환경에서 실행 중이면 추가 정보 출력
if (process.env.RAILWAY_ENVIRONMENT) {
    console.log('\n=== Railway 환경 감지 ===');
    console.log('Railway에서 실행 중입니다.');

    if (!process.env.CONFIG_MASTER_KEY) {
        console.log('\n🚨 중요: CONFIG_MASTER_KEY가 누락되었습니다!');
        console.log('이전 배포에서 사용된 CONFIG_MASTER_KEY를 Railway 환경변수에 추가해야 합니다.');
        console.log('이 키가 없으면 암호화된 환경변수들(DB 비밀번호, 이메일 비밀번호 등)을 읽을 수 없습니다.');
    }

    console.log('\n환경변수 설정 방법:');
    console.log('1. Railway 대시보드 접속: https://railway.app/dashboard');
    console.log('2. 프로젝트 선택 → Variables 탭');
    console.log('3. CONFIG_MASTER_KEY 환경변수 추가 (최소 32자)');
}

// 권장 해결 방법 출력
if (!process.env.CONFIG_MASTER_KEY) {
    console.log('\n=== 🔧 해결 방법 ===');
    console.log('1. 이전 배포에서 사용한 CONFIG_MASTER_KEY를 찾아서 Railway에 설정');
    console.log('2. 또는 새로운 CONFIG_MASTER_KEY를 생성하고 모든 환경변수를 다시 설정');
    console.log('3. 임시 해결: 암호화 없이 평문 환경변수 사용 (보안상 권장하지 않음)');
}
