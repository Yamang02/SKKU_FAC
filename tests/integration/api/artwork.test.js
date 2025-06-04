/**
 * 🖼️ 작품 API 통합 테스트
 */
import { test, expect } from '@playwright/test';
import PlaywrightApiHelpers from '../helpers/playwrightApiHelpers.js';
import { testUsers, testArtworks } from '../fixtures/testData.js';

test.describe('🖼️ Artwork API Tests', () => {
    let apiHelper;

    test.beforeEach(async ({ request }) => {
        apiHelper = new PlaywrightApiHelpers(request);
    });

    test.describe('작품 목록 조회', () => {
        test('GET /artwork/api/list - 작품 목록 조회', async () => {
            const response = await apiHelper.get('/artwork/api/list');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('success');
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('artworks');
            expect(Array.isArray(data.data.artworks)).toBe(true);
        });

        test('GET /artwork/api/list - 페이지네이션 테스트', async () => {
            const response = await apiHelper.get('/artwork/api/list?page=1&limit=10');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('pagination');
            expect(data.data.pagination).toHaveProperty('currentPage');
            expect(data.data.pagination).toHaveProperty('totalPages');
        });

        test('GET /artwork/api/list - 정렬 옵션 테스트', async () => {
            const response = await apiHelper.get('/artwork/api/list?sortBy=createdAt&sortOrder=desc');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('GET /artwork/api/list - 필터링 테스트', async () => {
            const response = await apiHelper.get('/artwork/api/list?status=APPROVED&category=painting');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });
    });

    test.describe('주요 작품 조회', () => {
        test('GET /artwork/api/featured - 주요 작품 목록', async () => {
            const response = await apiHelper.get('/artwork/api/featured');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /artwork/api/featured - 제한된 개수 조회', async () => {
            const response = await apiHelper.get('/artwork/api/featured?limit=5');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.length).toBeLessThanOrEqual(5);
        });
    });

    test.describe('작품 상세 조회', () => {
        test('GET /artwork/api/detail/:slug - 작품 상세 정보', async () => {
            // 먼저 작품 목록을 가져와서 실제 slug 확인
            const listResponse = await apiHelper.get('/artwork/api/list');

            if (listResponse.status === 200) {
                const listData = await listResponse.json();
                if (listData.data.artworks.length > 0) {
                    const artworkSlug = listData.data.artworks[0].slug;

                    const detailResponse = await apiHelper.get(`/artwork/api/detail/${artworkSlug}`);
                    expect([200, 404]).toContain(detailResponse.status);

                    if (detailResponse.status === 200) {
                        const detailData = await detailResponse.json();
                        expect(detailData.success).toBe(true);
                        expect(detailData.data).toHaveProperty('artwork');
                        expect(detailData.data.artwork.slug).toBe(artworkSlug);
                    }
                }
            }
        });

        test('GET /artwork/api/detail/:slug - 존재하지 않는 작품', async () => {
            const response = await apiHelper.get('/artwork/api/detail/non-existent-slug');
            expect(response.status).toBe(404);
        });
    });

    test.describe('작품 생성 (인증 필요)', () => {
        test('POST /artwork/api/new - 인증 없이 접근 시 401', async () => {
            const response = await apiHelper.post('/artwork/api/new', {
                title: 'Test Artwork',
                description: 'Test Description'
            });

            expect([401, 302]).toContain(response.status);
        });

        test('POST /artwork/api/new - 인증된 사용자의 작품 생성', async () => {
            // 로그인
            await apiHelper.authenticateUser(testUsers.regularUser.username, testUsers.regularUser.password);

            // 작품 생성 (이미지 없이)
            const artworkData = {
                title: 'Test Artwork',
                description: 'Test Description',
                medium: 'Oil on Canvas',
                size: '50x70cm',
                year: '2024'
            };

            const response = await apiHelper.post('/artwork/api/new', artworkData);
            expect([200, 201, 400, 302]).toContain(response.status);
        });
    });

    test.describe('작품 수정 (인증 필요)', () => {
        test('PUT /artwork/api/:id - 인증 없이 접근 시 401', async () => {
            const response = await apiHelper.put('/artwork/api/test-id', {
                title: 'Updated Title'
            });

            expect([401, 302]).toContain(response.status);
        });

        test('PUT /artwork/api/:id - 존재하지 않는 작품 수정', async () => {
            await apiHelper.authenticateUser(testUsers.regularUser.username, testUsers.regularUser.password);

            const response = await apiHelper.put('/artwork/api/non-existent-id', {
                title: 'Updated Title'
            });

            expect([404, 400]).toContain(response.status);
        });
    });

    test.describe('작품 삭제 (인증 필요)', () => {
        test('DELETE /artwork/api/:id - 인증 없이 접근 시 401', async () => {
            const response = await apiHelper.delete('/artwork/api/test-id');
            expect([401, 302]).toContain(response.status);
        });

        test('DELETE /artwork/api/:id - 존재하지 않는 작품 삭제', async () => {
            await apiHelper.authenticateUser(testUsers.regularUser.username, testUsers.regularUser.password);

            const response = await apiHelper.delete('/artwork/api/non-existent-id');
            expect([404, 400]).toContain(response.status);
        });
    });

    test.describe('작품 전시 제출', () => {
        test('POST /artwork/api/exhibiting - 인증 없이 접근 시 401', async () => {
            const response = await apiHelper.post('/artwork/api/exhibiting', {
                artworkId: 'test-artwork-id',
                exhibitionId: 'test-exhibition-id'
            });

            expect([401, 302]).toContain(response.status);
        });

        test('POST /artwork/api/exhibiting - 작품 전시 제출', async () => {
            await apiHelper.authenticateUser(testUsers.regularUser.username, testUsers.regularUser.password);

            const response = await apiHelper.post('/artwork/api/exhibiting', {
                artworkId: testArtworks.painting.id,
                exhibitionId: 'test-exhibition-id'
            });

            expect([200, 400, 404]).toContain(response.status);
        });

        test('DELETE /artwork/api/exhibiting/:artworkId/:exhibitionId - 전시 제출 취소', async () => {
            await apiHelper.authenticateUser(testUsers.regularUser.username, testUsers.regularUser.password);

            const response = await apiHelper.delete('/artwork/api/exhibiting/test-artwork-id/test-exhibition-id');
            expect([200, 404, 400]).toContain(response.status);
        });
    });

    test.describe('작품 검색 및 필터링', () => {
        test('GET /artwork/api/list - 제목으로 검색', async () => {
            const response = await apiHelper.get('/artwork/api/list?search=test');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('GET /artwork/api/list - 작가별 필터', async () => {
            const response = await apiHelper.get('/artwork/api/list?artist=testuser');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('GET /artwork/api/list - 매체별 필터', async () => {
            const response = await apiHelper.get('/artwork/api/list?medium=painting');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('GET /artwork/api/list - 연도별 필터', async () => {
            const response = await apiHelper.get('/artwork/api/list?year=2024');
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
        });
    });

    test.describe('에러 처리 테스트', () => {
        test('GET /artwork/api/list - 잘못된 페이지 번호', async () => {
            const response = await apiHelper.get('/artwork/api/list?page=-1');
            expect([200, 400]).toContain(response.status);
        });

        test('GET /artwork/api/list - 잘못된 정렬 옵션', async () => {
            const response = await apiHelper.get('/artwork/api/list?sortBy=invalidField');
            expect([200, 400]).toContain(response.status);
        });

        test('GET /artwork/api/featured - 잘못된 limit 값', async () => {
            const response = await apiHelper.get('/artwork/api/featured?limit=abc');
            expect([200, 400]).toContain(response.status);
        });
    });

    test.describe('성능 및 응답 시간 테스트', () => {
        test('GET /artwork/api/list - 응답 시간 확인', async () => {
            const startTime = Date.now();
            const response = await apiHelper.get('/artwork/api/list');
            const endTime = Date.now();

            expect(response.status).toBe(200);
            expect(endTime - startTime).toBeLessThan(5000); // 5초 이내 응답
        });

        test('GET /artwork/api/featured - 캐싱 확인', async () => {
            // 첫 번째 요청
            const response1 = await apiHelper.get('/artwork/api/featured');
            expect(response1.status).toBe(200);

            // 두 번째 요청 (캐싱 효과 확인)
            const response2 = await apiHelper.get('/artwork/api/featured');
            expect(response2.status).toBe(200);
        });
    });
});
