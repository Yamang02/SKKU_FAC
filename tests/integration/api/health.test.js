/**
 * 🏥 헬스체크 API 통합 테스트
 * 새로운 테스트 훅 시스템을 사용한 개선된 버전
 */
import { test, expect } from '@playwright/test';
import PlaywrightApiHelpers from '../helpers/playwrightApiHelpers.js';
import { setupMinimalTestEnvironment } from '../helpers/testHooks.js';

// 최소한의 테스트 환경 설정 (데이터 시딩 불필요)
const testHooks = setupMinimalTestEnvironment();

test.describe('🏥 Health Check API Tests', () => {
    let apiHelper;

    test.beforeEach(async ({ request }) => {
        apiHelper = new PlaywrightApiHelpers(request);
    });

    test.describe('기본 헬스체크', () => {
        test('GET /health - 서버 상태 확인', async () => {
            const response = await apiHelper.get('/health');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('status');
            expect(data.status).toBe('healthy');
            expect(data).toHaveProperty('timestamp');
            expect(data).toHaveProperty('uptime');
        });

        test('GET /health - 응답 시간 확인', async () => {
            const startTime = Date.now();
            const response = await apiHelper.get('/health');
            const endTime = Date.now();

            expect(response.status()).toBe(200);
            expect(endTime - startTime).toBeLessThan(1000); // 1초 이내 응답
        });
    });

    test.describe('상세 헬스체크', () => {
        test('GET /health - 데이터베이스 연결 상태', async () => {
            const response = await apiHelper.get('/health');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('database');
            expect(data.database).toHaveProperty('connected');
            expect(data.database.connected).toBe(true);
        });

        test('GET /health - Redis 연결 상태', async () => {
            const response = await apiHelper.get('/health');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('redis');
            expect(data.redis).toHaveProperty('connected');
            expect(data.redis.connected).toBe(true);
        });

        test('GET /health - 시스템 정보 포함', async () => {
            const response = await apiHelper.get('/health');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('system');
            expect(data.system).toHaveProperty('environment');
            expect(data.system).toHaveProperty('version');
            expect(data.system).toHaveProperty('nodeVersion');
        });
    });

    test.describe('헬스체크 안정성', () => {
        test('GET /health - 연속 요청 처리', async () => {
            const requests = Array(5).fill().map(() => apiHelper.get('/health'));
            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.status()).toBe(200);
            });
        });

        test('GET /health - 동시 요청 처리', async () => {
            const concurrentRequests = Array(10).fill().map(async () => {
                const response = await apiHelper.get('/health');
                expect(response.status()).toBe(200);
                return response.json();
            });

            const results = await Promise.all(concurrentRequests);

            // 모든 응답이 유효한 헬스체크 데이터를 포함하는지 확인
            results.forEach(data => {
                expect(data.status).toBe('healthy');
                expect(data).toHaveProperty('timestamp');
            });
        });
    });
});
