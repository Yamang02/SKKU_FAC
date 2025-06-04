import { createClient } from 'redis';

console.log('=== DIRECT REDIS CONNECTION TEST ===');

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT || '6379';
const password = process.env.REDIS_PASSWORD;
const username = process.env.REDIS_USERNAME || 'default';

console.log('Host:', host);
console.log('Port:', port);
console.log('Username:', username);
console.log('Password length:', password ? password.length : 0);

if (!host) {
    console.error('REDIS_HOST not set!');
    process.exit(1);
}

// Redis Cloud는 보통 다음 형식들을 사용:
const connectionOptions = [
    // 1. 기본 redis:// 형식
    {
        name: 'Basic redis://',
        url: `redis://:${password}@${host}:${port}`
    },
    // 2. TLS rediss:// 형식
    {
        name: 'TLS rediss://',
        url: `rediss://:${password}@${host}:${port}`
    },
    // 3. username과 함께
    {
        name: 'With username',
        url: `redis://${username}:${password}@${host}:${port}`
    },
    // 4. TLS + username
    {
        name: 'TLS with username',
        url: `rediss://${username}:${password}@${host}:${port}`
    },
    // 5. 포트 14749 (호스트명에서 추출)
    {
        name: 'Port 14749',
        url: `redis://:${password}@${host}:14749`
    },
    // 6. TLS + 포트 14749
    {
        name: 'TLS Port 14749',
        url: `rediss://:${password}@${host}:14749`
    }
];

async function testConnection(option) {
    console.log(`\n--- Testing: ${option.name} ---`);
    console.log('URL:', option.url.replace(/:[^@]*@/, ':***@'));

    const client = createClient({
        url: option.url,
        socket: {
            connectTimeout: 10000,
            tls: option.url.startsWith('rediss://'),
            rejectUnauthorized: false // Redis Cloud 인증서 문제 해결
        }
    });

    client.on('error', (err) => {
        console.log('Connection error:', err.message);
    });

    try {
        await client.connect();
        console.log('✅ Connection successful!');

        const pong = await client.ping();
        console.log('✅ Ping successful:', pong);

        await client.disconnect();
        return true;
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        try {
            await client.disconnect();
        } catch (e) {
            // ignore disconnect errors
        }
        return false;
    }
}

async function runTests() {
    for (const option of connectionOptions) {
        const success = await testConnection(option);
        if (success) {
            console.log(`\n🎉 SUCCESS WITH: ${option.name}`);
            console.log(`Use this URL format: ${option.url.replace(/:[^@]*@/, ':***@')}`);
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    }

    console.log('\n=== TEST COMPLETE ===');
    process.exit(0);
}

runTests().catch(console.error);
