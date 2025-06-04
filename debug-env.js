console.log('=== RAILWAY ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDIS_PASSWORD length:', process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD.length : 'NOT SET');
console.log('REDIS_USERNAME:', process.env.REDIS_USERNAME || 'NOT SET');
console.log('REDIS_URL:', process.env.REDIS_URL || 'NOT SET');
console.log('REDIS_DB:', process.env.REDIS_DB || 'NOT SET');
console.log('REDIS_CACHE_DB:', process.env.REDIS_CACHE_DB || 'NOT SET');
console.log('REDIS_TTL:', process.env.REDIS_TTL || 'NOT SET');

// Redis URL 구성 테스트
if (process.env.REDIS_HOST) {
    let testUrl = 'redis://';
    if (process.env.REDIS_PASSWORD) {
        testUrl += `:${process.env.REDIS_PASSWORD}@`;
    }
    testUrl += `${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`;
    console.log('Constructed Redis URL:', testUrl.replace(/:[^@]*@/, ':***@'));
}

console.log('=== END DEBUG ===');
process.exit(0);
