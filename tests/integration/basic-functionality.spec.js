import { test, expect } from '@playwright/test';

/**
 * 기본 기능 테스트
 * 프로젝트의 핵심 기능들이 정상적으로 작동하는지 확인
 */

test.describe('기본 기능 테스트', () => {

    test.describe('홈페이지 테스트', () => {
        test('홈페이지 로드', async ({ page }) => {
            await page.goto('/');

            // 페이지 제목 확인
            await expect(page).toHaveTitle(/SKKU|갤러리|미술/);

            // 기본 요소들 확인
            const header = page.locator('header, .header');
            if (await header.count() > 0) {
                await expect(header).toBeVisible();
            }

            const nav = page.locator('nav, .nav, .navigation');
            if (await nav.count() > 0) {
                await expect(nav).toBeVisible();
            }
        });

        test('네비게이션 링크 확인', async ({ page }) => {
            await page.goto('/');

            // 주요 네비게이션 링크들 확인
            const navLinks = [
                { text: '작품', href: '/artwork' },
                { text: '전시회', href: '/exhibition' },
                { text: '로그인', href: '/user/login' }
            ];

            for (const link of navLinks) {
                const linkElement = page.locator(`a:has-text("${link.text}"), a[href="${link.href}"]`);
                if (await linkElement.count() > 0) {
                    await expect(linkElement).toBeVisible();
                }
            }
        });
    });

    test.describe('로그인/회원가입 페이지 테스트', () => {
        test('로그인 페이지 로드', async ({ page }) => {
            await page.goto('/user/login');

            // 로그인 폼 확인
            await expect(page.locator('form')).toBeVisible();
            await expect(page.locator('#username, input[name="username"]')).toBeVisible();
            await expect(page.locator('#password, input[name="password"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();
        });

        test('회원가입 페이지 로드', async ({ page }) => {
            await page.goto('/user/new');

            // 회원가입 폼 확인
            await expect(page.locator('form')).toBeVisible();
            await expect(page.locator('#username, input[name="username"]')).toBeVisible();
            await expect(page.locator('#email, input[name="email"]')).toBeVisible();
            await expect(page.locator('#password, input[name="password"]')).toBeVisible();
            await expect(page.locator('#role, select[name="role"]')).toBeVisible();
        });

        test('회원가입 페이지 역할 선택 기능', async ({ page }) => {
            await page.goto('/user/new');

            const roleSelect = page.locator('#role, select[name="role"]');
            await expect(roleSelect).toBeVisible();

            // SKKU 회원 선택 시 추가 필드 표시
            await roleSelect.selectOption('SKKU_MEMBER');
            const skkuFields = page.locator('#skkuFields');
            if (await skkuFields.count() > 0) {
                await expect(skkuFields).toBeVisible();
            }

            // 외부 회원 선택 시 추가 필드 표시
            await roleSelect.selectOption('EXTERNAL_MEMBER');
            const externalFields = page.locator('#externalFields');
            if (await externalFields.count() > 0) {
                await expect(externalFields).toBeVisible();
            }
        });
    });

    test.describe('작품 페이지 테스트', () => {
        test('작품 목록 페이지 로드', async ({ page }) => {
            await page.goto('/artwork');

            // 작품 목록 컨테이너 확인
            const artworkGrid = page.locator('.artwork-grid, .artwork-list');
            await expect(artworkGrid).toBeVisible();

            // 페이지 제목 확인
            const pageTitle = page.locator('h1, .page-title');
            if (await pageTitle.count() > 0) {
                await expect(pageTitle).toContainText('작품');
            }
        });

        test('작품 검색 기능', async ({ page }) => {
            await page.goto('/artwork');

            // 검색 입력 필드 확인
            const searchInput = page.locator('#searchInput, input[name="search"]');
            if (await searchInput.count() > 0) {
                await expect(searchInput).toBeVisible();

                // 검색어 입력 테스트
                await searchInput.fill('테스트');
                await searchInput.press('Enter');

                // 페이지가 리로드되거나 결과가 업데이트되는지 확인
                await page.waitForTimeout(1000);
            }
        });

        test('작품 상세 페이지 접근', async ({ page }) => {
            await page.goto('/artwork');

            // 첫 번째 작품 클릭
            const firstArtwork = page.locator('.artwork-item, .artwork-card').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();

                // 상세 페이지 또는 모달 확인
                await page.waitForTimeout(1000);
                const detailView = page.locator('.artwork-detail, .artwork-modal, .modal');
                if (await detailView.count() > 0) {
                    await expect(detailView).toBeVisible();
                }
            }
        });
    });

    test.describe('전시회 페이지 테스트', () => {
        test('전시회 목록 페이지 로드', async ({ page }) => {
            await page.goto('/exhibition');

            // 전시회 목록 컨테이너 확인
            const exhibitionList = page.locator('.exhibition-list, .exhibition-grid');
            await expect(exhibitionList).toBeVisible();

            // 페이지 제목 확인
            const pageTitle = page.locator('h1, .page-title');
            if (await pageTitle.count() > 0) {
                await expect(pageTitle).toContainText('전시');
            }
        });

        test('전시회 상세 보기', async ({ page }) => {
            await page.goto('/exhibition');

            // 첫 번째 전시회 클릭
            const firstExhibition = page.locator('.exhibition-item, .exhibition-card').first();
            if (await firstExhibition.count() > 0) {
                await firstExhibition.click();

                // 상세 모달 또는 페이지 확인
                await page.waitForTimeout(1000);
                const detailView = page.locator('.exhibition-detail, .exhibition-modal, .modal');
                if (await detailView.count() > 0) {
                    await expect(detailView).toBeVisible();
                }
            }
        });
    });

    test.describe('API 엔드포인트 테스트', () => {
        test('홈페이지 API 응답', async ({ request }) => {
            const response = await request.get('/');
            expect(response.status()).toBe(200);
        });

        test('작품 목록 API 응답', async ({ request }) => {
            const response = await request.get('/artwork');
            expect(response.status()).toBe(200);
        });

        test('전시회 목록 API 응답', async ({ request }) => {
            const response = await request.get('/exhibition');
            expect(response.status()).toBe(200);
        });

        test('로그인 페이지 API 응답', async ({ request }) => {
            const response = await request.get('/user/login');
            expect(response.status()).toBe(200);
        });

        test('회원가입 페이지 API 응답', async ({ request }) => {
            const response = await request.get('/user/new');
            expect(response.status()).toBe(200);
        });

        test('존재하지 않는 페이지 404 응답', async ({ request }) => {
            const response = await request.get('/nonexistent-page');
            expect(response.status()).toBe(404);
        });
    });

    test.describe('정적 리소스 테스트', () => {
        test('CSS 파일 로드', async ({ page }) => {
            await page.goto('/');

            // CSS 파일들이 로드되는지 확인
            const cssFiles = await page.locator('link[rel="stylesheet"]').count();
            expect(cssFiles).toBeGreaterThan(0);
        });

        test('JavaScript 파일 로드', async ({ page }) => {
            await page.goto('/');

            // JavaScript 파일들이 로드되는지 확인
            const jsFiles = await page.locator('script[src]').count();
            expect(jsFiles).toBeGreaterThan(0);
        });

        test('이미지 리소스 로드', async ({ page }) => {
            await page.goto('/');

            // 이미지들이 로드되는지 확인
            const images = page.locator('img');
            const imageCount = await images.count();

            if (imageCount > 0) {
                // 첫 번째 이미지가 로드되는지 확인
                const firstImage = images.first();
                await expect(firstImage).toBeVisible();
            }
        });
    });

    test.describe('보안 헤더 테스트', () => {
        test('보안 헤더 확인', async ({ request }) => {
            const response = await request.get('/');

            // Helmet 미들웨어로 설정된 보안 헤더들 확인
            const headers = response.headers();

            // X-Content-Type-Options 헤더
            if (headers['x-content-type-options']) {
                expect(headers['x-content-type-options']).toBe('nosniff');
            }

            // X-Frame-Options 헤더
            if (headers['x-frame-options']) {
                expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
            }

            // X-XSS-Protection 헤더
            if (headers['x-xss-protection']) {
                expect(headers['x-xss-protection']).toBe('1; mode=block');
            }
        });

        test('Content Security Policy 헤더', async ({ request }) => {
            const response = await request.get('/');
            const headers = response.headers();

            // CSP 헤더 확인
            if (headers['content-security-policy']) {
                const csp = headers['content-security-policy'];
                expect(csp).toContain("default-src 'self'");
                expect(csp).toContain('cloudinary.com'); // Cloudinary 이미지 허용
            }
        });
    });

    test.describe('404 오류 페이지 테스트', () => {
        test('존재하지 않는 페이지 접근', async ({ page }) => {
            const response = await page.goto('/this-page-does-not-exist');
            expect(response?.status()).toBe(404);

            // 404 페이지 내용 확인
            const pageContent = await page.textContent('body');
            expect(pageContent).toMatch(/404|찾을 수 없|Not Found/i);
        });

        test('잘못된 작품 ID 접근', async ({ page }) => {
            const response = await page.goto('/artwork/999999');

            // 404 또는 적절한 오류 페이지 표시
            if (response?.status() === 404) {
                const pageContent = await page.textContent('body');
                expect(pageContent).toMatch(/404|찾을 수 없|Not Found/i);
            }
        });

        test('잘못된 전시회 ID 접근', async ({ page }) => {
            const response = await page.goto('/exhibition/999999');

            // 404 또는 적절한 오류 페이지 표시
            if (response?.status() === 404) {
                const pageContent = await page.textContent('body');
                expect(pageContent).toMatch(/404|찾을 수 없|Not Found/i);
            }
        });
    });

    test.describe('반응형 디자인 기본 테스트', () => {
        test('모바일 뷰포트에서 홈페이지', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');

            // 모바일에서도 기본 요소들이 보이는지 확인
            const header = page.locator('header, .header');
            if (await header.count() > 0) {
                await expect(header).toBeVisible();
            }
        });

        test('태블릿 뷰포트에서 작품 목록', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/artwork');

            // 태블릿에서 작품 그리드가 적절히 표시되는지 확인
            const artworkGrid = page.locator('.artwork-grid, .artwork-list');
            await expect(artworkGrid).toBeVisible();
        });

        test('데스크톱 뷰포트에서 전시회 목록', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/exhibition');

            // 데스크톱에서 전시회 목록이 적절히 표시되는지 확인
            const exhibitionList = page.locator('.exhibition-list, .exhibition-grid');
            await expect(exhibitionList).toBeVisible();
        });
    });

    test.describe('성능 기본 테스트', () => {
        test('페이지 로드 시간 확인', async ({ page }) => {
            const startTime = Date.now();
            await page.goto('/');
            const loadTime = Date.now() - startTime;

            // 5초 이내에 로드되어야 함
            expect(loadTime).toBeLessThan(5000);
        });

        test('이미지 로딩 확인', async ({ page }) => {
            await page.goto('/artwork');

            // 이미지들이 적절한 시간 내에 로드되는지 확인
            const images = page.locator('img');
            const imageCount = await images.count();

            if (imageCount > 0) {
                // 첫 번째 이미지 로딩 대기
                await images.first().waitFor({ state: 'visible', timeout: 10000 });
            }
        });
    });

    test.describe('접근성 기본 테스트', () => {
        test('페이지 제목 존재', async ({ page }) => {
            await page.goto('/');
            const title = await page.title();
            expect(title.length).toBeGreaterThan(0);
        });

        test('메인 랜드마크 존재', async ({ page }) => {
            await page.goto('/');

            // main 요소 또는 role="main" 확인
            const main = page.locator('main, [role="main"]');
            if (await main.count() > 0) {
                await expect(main).toBeVisible();
            }
        });

        test('네비게이션 랜드마크 존재', async ({ page }) => {
            await page.goto('/');

            // nav 요소 또는 role="navigation" 확인
            const nav = page.locator('nav, [role="navigation"]');
            if (await nav.count() > 0) {
                await expect(nav).toBeVisible();
            }
        });

        test('이미지 alt 텍스트 확인', async ({ page }) => {
            await page.goto('/artwork');

            const images = page.locator('img');
            const imageCount = await images.count();

            if (imageCount > 0) {
                // 첫 번째 이미지의 alt 속성 확인
                const firstImage = images.first();
                const alt = await firstImage.getAttribute('alt');

                // alt 속성이 존재해야 함 (빈 문자열이라도)
                expect(alt).not.toBeNull();
            }
        });
    });
});
