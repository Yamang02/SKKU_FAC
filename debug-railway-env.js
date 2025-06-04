console.log('🔍 Railway 환경변수 확인\n');

// 이메일 관련 환경변수들 확인
console.log('📧 이메일 관련 환경변수:');
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? `${process.env.GMAIL_PASS.substring(0, 4)}${'*'.repeat(Math.max(0, process.env.GMAIL_PASS.length - 4))}` : 'undefined');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}${'*'.repeat(Math.max(0, process.env.EMAIL_PASS.length - 4))}` : 'undefined');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('');

// Redis 관련 환경변수들 확인
console.log('📦 Redis 관련 환경변수:');
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***masked***' : 'undefined');
console.log('REDIS_URL:', process.env.REDIS_URL ? '***masked***' : 'undefined');
console.log('');

// 기타 중요한 환경변수들
console.log('🌍 기타 환경변수:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***masked***' : 'undefined');
console.log('');

// Railway 특정 환경변수들
console.log('🚂 Railway 특정 환경변수:');
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('RAILWAY_PROJECT_ID:', process.env.RAILWAY_PROJECT_ID);
console.log('RAILWAY_SERVICE_ID:', process.env.RAILWAY_SERVICE_ID);
console.log('');

// 모든 환경변수 중 EMAIL, GMAIL, REDIS 관련된 것들만 필터링
console.log('🔎 모든 이메일/Redis 관련 환경변수:');
Object.keys(process.env)
    .filter(key => key.includes('EMAIL') || key.includes('GMAIL') || key.includes('REDIS'))
    .sort()
    .forEach(key => {
        const value = process.env[key];
        if (key.includes('PASS') || key.includes('PASSWORD') || key.includes('SECRET')) {
            console.log(`${key}:`, value ? '***masked***' : 'undefined');
        } else if (key.includes('URL') && value) {
            console.log(`${key}:`, '***masked***');
        } else {
            console.log(`${key}:`, value);
        }
    });
