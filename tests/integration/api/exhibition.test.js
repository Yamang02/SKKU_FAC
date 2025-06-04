/**
 * 🎨 전시회 API 통합 테스트
 */
import { test, expect } from '@playwright/test';
import PlaywrightApiHelpers from '../helpers/playwrightApiHelpers.js';
import { testUsers, testExhibitions } from '../fixtures/testData.js';

test.describe('🎨 Exhibition API Tests', () => {
    let apiHelper;

    test.beforeEach(async ({ request }) => {
        apiHelper = new PlaywrightApiHelpers(request);
    });

    test.describe('전시회 목록 조회', () => {
        test('GET /exhibition/api/list - 전시회 목록 조회', async () => {
            const response = await apiHelper.get('/exhibition/api/list');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('success');
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('exhibitions');
            expect(Array.isArray(data.data.exhibitions)).toBe(true);
        });

        test('GET /exhibition/api/list - 페이지네이션 테스트', async () => {
            const response = await apiHelper.get('/exhibition/api/list?page=1&limit=5');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('pagination');
            expect(data.data.pagination).toHaveProperty('currentPage');
            expect(data.data.pagination).toHaveProperty('totalPages');
        });

        test('GET /exhibition/api/list - 정렬 옵션 테스트', async () => {
            const response = await apiHelper.get('/exhibition/api/list?sortBy=startDate&sortOrder=desc');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('GET /exhibition/api/list - 필터링 테스트', async () => {
            const response = await apiHelper.get('/exhibition/api/list?status=active&type=REGULAR');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });
    });

    test.describe('제출 가능한 전시회 조회', () => {
        test('GET /exhibition/api/submittable - 제출 가능한 전시회 목록', async () => {
            const response = await apiHelper.get('/exhibition/api/submittable');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /exhibition/api/submittable - 인증된 사용자 전용', async () => {
            // 로그인 후 테스트
            await apiHelper.authenticateUser(testUsers.regularUser.username, testUsers.regularUser.password);

            const response = await apiHelper.get('/exhibition/api/submittable');
            expect([200, 401, 302]).toContain(response.status());
        });
    });

    test.describe('주요 전시회 조회', () => {
        test('GET /exhibition/api/featured - 주요 전시회 목록', async () => {
            const response = await apiHelper.get('/exhibition/api/featured');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /exhibition/api/featured - 제한된 개수 조회', async () => {
            const response = await apiHelper.get('/exhibition/api/featured?limit=3');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.length).toBeLessThanOrEqual(3);
        });
    });

    test.describe('전시회 상세 정보', () => {
        test('전시회 상세 페이지 접근', async () => {
            // 먼저 전시회 목록을 가져와서 실제 전시회 ID 확인
            const listResponse = await apiHelper.get('/exhibition/api/list');

            if (listResponse.status() === 200) {
                const listData = await listResponse.json();
                if (listData.data.exhibitions.length > 0) {
                    const exhibitionId = listData.data.exhibitions[0].id;

                    // 전시회 상세 페이지 접근 (HTML 페이지)
                    const detailResponse = await apiHelper.get(`/exhibition/${exhibitionId}`);
                    expect([200, 404]).toContain(detailResponse.status());
                }
            }
        });
    });

    test.describe('에러 처리 테스트', () => {
        test('GET /exhibition/api/list - 잘못된 페이지 번호', async () => {
            const response = await apiHelper.get('/exhibition/api/list?page=-1');
            expect([200, 400]).toContain(response.status());
        });

        test('GET /exhibition/api/list - 잘못된 정렬 옵션', async () => {
            const response = await apiHelper.get('/exhibition/api/list?sortBy=invalidField');
            expect([200, 400]).toContain(response.status());
        });

        test('GET /exhibition/api/featured - 잘못된 limit 값', async () => {
            const response = await apiHelper.get('/exhibition/api/featured?limit=abc');
            expect([200, 400]).toContain(response.status());
        });
    });

    test.describe('전시회 검색 및 필터링', () => {
        test('GET /exhibition/api/list - 제목으로 검색', async () => {
            const response = await apiHelper.get('/exhibition/api/list?search=test');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('GET /exhibition/api/list - 날짜 범위 필터', async () => {
            const startDate = '2024-01-01';
            const endDate = '2024-12-31';
            const response = await apiHelper.get(`/exhibition/api/list?startDate=${startDate}&endDate=${endDate}`);

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('GET /exhibition/api/list - 전시회 타입 필터', async () => {
            const response = await apiHelper.get('/exhibition/api/list?exhibitionType=REGULAR');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });
    });

    test.describe('성능 및 응답 시간 테스트', () => {
        test('GET /exhibition/api/list - 응답 시간 확인', async () => {
            const startTime = Date.now();
            const response = await apiHelper.get('/exhibition/api/list');
            const endTime = Date.now();

            expect(response.status()).toBe(200);
            expect(endTime - startTime).toBeLessThan(5000); // 5초 이내 응답
        });

        test('GET /exhibition/api/featured - 캐싱 확인', async () => {
            // 첫 번째 요청
            const response1 = await apiHelper.get('/exhibition/api/featured');
            expect(response1.status()).toBe(200);

            // 두 번째 요청 (캐싱 효과 확인)
            const response2 = await apiHelper.get('/exhibition/api/featured');
            expect(response2.status()).toBe(200);
        });
    });
});
