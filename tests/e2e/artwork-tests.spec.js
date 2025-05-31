import { test, expect } from '@playwright/test';
import {
    generateTestUser,
    loginUser,
    waitForPageLoad,
    expectSuccessMessage,
    expectErrorMessage,
    captureScreenshot
} from './helpers/test-helpers.js';

/**
 * 작품 관련 테스트 (U_10, U_20, U_30, U_40, U_41)
 * 실제 프로젝트 구조 기반 작품 관리 테스트
 */

test.describe('작품 관련 테스트 - 실제 구조 기반', () => {

    // ========================================
    // 2.1 작품 목록 및 검색 테스트 (U_10)
    // ========================================
    test.describe('작품 목록 및 검색 테스트 (U_10)', () => {

        test('작품 목록 페이지 로드', async ({ page }) => {
            await page.goto('/artwork');
            await captureScreenshot(page, 'artwork-list-page');

            // 작품 목록 컨테이너 확인
            await expect(page.locator('.artwork-grid')).toBeVisible();

            // 페이지 제목 확인
            await expect(page.locator('h1')).toContainText('작품');
        });

        test('작품명으로 검색', async ({ page }) => {
            await page.goto('/artwork');

            // 검색 입력 필드 확인
            const searchInput = page.locator('#searchInput, input[name="search"]');
            await expect(searchInput).toBeVisible();

            // 검색어 입력
            await searchInput.fill('테스트 작품');

            // 검색 버튼 클릭 또는 엔터
            const searchButton = page.locator('button:has-text("검색"), .search-button');
            if (await searchButton.count() > 0) {
                await searchButton.click();
            } else {
                await searchInput.press('Enter');
            }

            await waitForPageLoad(page);
            await captureScreenshot(page, 'artwork-search-results');
        });

        test('작가명으로 검색', async ({ page }) => {
            await page.goto('/artwork');

            // 작가명 검색 필드 (있다면)
            const artistSearchInput = page.locator('#artistSearch, input[name="artist"]');
            if (await artistSearchInput.count() > 0) {
                await artistSearchInput.fill('테스트 작가');
                await artistSearchInput.press('Enter');
                await waitForPageLoad(page);
            }
        });

        test('전시회별 작품 필터링', async ({ page }) => {
            await page.goto('/artwork');

            // 전시회 필터 드롭다운 확인
            const exhibitionFilter = page.locator('#exhibitionFilter, select[name="exhibition"]');
            if (await exhibitionFilter.count() > 0) {
                // 첫 번째 전시회 선택
                await exhibitionFilter.selectOption({ index: 1 });
                await waitForPageLoad(page);
                await captureScreenshot(page, 'artwork-filtered-by-exhibition');
            }
        });

        test('고급 검색 기능', async ({ page }) => {
            await page.goto('/artwork');

            // 고급 검색 토글 버튼
            const advancedSearchToggle = page.locator('#advancedSearchToggle, .advanced-search-toggle');
            if (await advancedSearchToggle.count() > 0) {
                await advancedSearchToggle.click();

                // 고급 검색 폼이 나타나는지 확인
                const advancedSearchForm = page.locator('.advanced-search-form, #advancedSearchForm');
                await expect(advancedSearchForm).toBeVisible();

                await captureScreenshot(page, 'artwork-advanced-search');
            }
        });
    });

    // ========================================
    // 2.2 작품 상세 보기 테스트 (U_20)
    // ========================================
    test.describe('작품 상세 보기 테스트 (U_20)', () => {

        test('작품 상세 페이지 접근', async ({ page }) => {
            await page.goto('/artwork');

            // 첫 번째 작품 클릭
            const firstArtwork = page.locator('.artwork-item, .artwork-card').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 작품 상세 정보 확인
                await expect(page.locator('.artwork-detail, .artwork-info')).toBeVisible();
                await captureScreenshot(page, 'artwork-detail-page');
            }
        });

        test('작품 이미지 표시', async ({ page }) => {
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 작품 이미지 확인
                const artworkImage = page.locator('.artwork-image, .main-image img');
                await expect(artworkImage).toBeVisible();

                // Cloudinary URL 패턴 확인
                const imageSrc = await artworkImage.getAttribute('src');
                if (imageSrc) {
                    expect(imageSrc).toContain('cloudinary.com');
                }
            }
        });

        test('작품 정보 표시', async ({ page }) => {
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 작품 정보 필드들 확인
                const infoFields = [
                    '.artwork-title, .title',
                    '.artwork-artist, .artist',
                    '.artwork-description, .description',
                    '.artwork-medium, .medium',
                    '.artwork-size, .size'
                ];

                for (const field of infoFields) {
                    const element = page.locator(field);
                    if (await element.count() > 0) {
                        await expect(element).toBeVisible();
                    }
                }
            }
        });

        test('관련 작품 표시', async ({ page }) => {
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 관련 작품 섹션 확인
                const relatedArtworks = page.locator('.related-artworks, .similar-artworks');
                if (await relatedArtworks.count() > 0) {
                    await expect(relatedArtworks).toBeVisible();
                    await captureScreenshot(page, 'artwork-related-works');
                }
            }
        });
    });

    // ========================================
    // 2.3 작품 업로드 테스트 (U_30)
    // ========================================
    test.describe('작품 업로드 테스트 (U_30)', () => {

        test('작품 업로드 페이지 접근 (로그인 필요)', async ({ page }) => {
            // 로그인
            await loginUser(page, 'admin', 'admin123');

            // 작품 업로드 페이지로 이동
            await page.goto('/artwork/new');
            await captureScreenshot(page, 'artwork-upload-page');

            // 업로드 폼 확인
            await expect(page.locator('form')).toBeVisible();
            await expect(page.locator('input[type="file"]')).toBeVisible();
        });

        test('목록 페이지에서 작품 업로드', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/artwork');

            // 작품 업로드 버튼 확인
            const uploadButton = page.locator('a:has-text("업로드"), button:has-text("업로드"), .upload-button');
            if (await uploadButton.count() > 0) {
                await uploadButton.click();
                await expect(page).toHaveURL(/\/artwork\/new/);
            }
        });

        test('작품 정보 입력 및 업로드', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/artwork/new');

            // 작품 정보 입력
            await page.fill('#title, input[name="title"]', '테스트 작품');
            await page.fill('#description, textarea[name="description"]', '테스트 작품 설명');
            await page.fill('#medium, input[name="medium"]', '디지털 아트');
            await page.fill('#size, input[name="size"]', '1920x1080');

            // 파일 업로드 (테스트 이미지 필요)
            const fileInput = page.locator('input[type="file"]');
            // 실제 테스트에서는 테스트 이미지 파일 경로 사용
            // await fileInput.setInputFiles('test-image.jpg');

            await captureScreenshot(page, 'artwork-upload-form-filled');

            // 업로드 버튼 클릭
            const submitButton = page.locator('button[type="submit"], .submit-button');
            await submitButton.click();

            // 업로드 결과 확인
            await waitForPageLoad(page);
        });

        test('전시회 모달에서 작품 업로드', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/exhibition');

            // 전시회 상세 페이지로 이동
            const firstExhibition = page.locator('.exhibition-item').first();
            if (await firstExhibition.count() > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 작품 업로드 버튼 (전시회 내)
                const uploadToExhibitionButton = page.locator('button:has-text("작품 출품"), .submit-artwork');
                if (await uploadToExhibitionButton.count() > 0) {
                    await uploadToExhibitionButton.click();

                    // 모달 또는 폼 확인
                    const uploadModal = page.locator('.modal, .upload-modal');
                    if (await uploadModal.count() > 0) {
                        await expect(uploadModal).toBeVisible();
                        await captureScreenshot(page, 'artwork-upload-modal');
                    }
                }
            }
        });
    });

    // ========================================
    // 2.4 작품 수정/삭제 테스트 (U_40)
    // ========================================
    test.describe('작품 수정/삭제 테스트 (U_40)', () => {

        test('작품 수정 권한 확인', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/artwork');

            // 첫 번째 작품 상세 페이지로 이동
            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 수정 버튼 확인 (작품 소유자 또는 관리자만)
                const editButton = page.locator('button:has-text("수정"), a:has-text("수정"), .edit-button');
                if (await editButton.count() > 0) {
                    await expect(editButton).toBeVisible();
                    await captureScreenshot(page, 'artwork-edit-button');
                }
            }
        });

        test('작품 정보 수정', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                const editButton = page.locator('button:has-text("수정"), a:has-text("수정")');
                if (await editButton.count() > 0) {
                    await editButton.click();
                    await waitForPageLoad(page);

                    // 수정 폼 확인
                    const titleInput = page.locator('#title, input[name="title"]');
                    if (await titleInput.count() > 0) {
                        await titleInput.fill('수정된 작품 제목');

                        const saveButton = page.locator('button[type="submit"], .save-button');
                        await saveButton.click();
                        await waitForPageLoad(page);
                    }
                }
            }
        });

        test('작품 삭제 권한 및 기능', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 삭제 버튼 확인 (상세 페이지에서만)
                const deleteButton = page.locator('button:has-text("삭제"), .delete-button');
                if (await deleteButton.count() > 0) {
                    await expect(deleteButton).toBeVisible();

                    // 삭제 확인 대화상자 처리
                    page.on('dialog', dialog => {
                        expect(dialog.message()).toContain('삭제');
                        dialog.dismiss(); // 실제 삭제하지 않음
                    });

                    await deleteButton.click();
                    await captureScreenshot(page, 'artwork-delete-confirmation');
                }
            }
        });

        test('권한 없는 사용자 수정/삭제 제한', async ({ page }) => {
            // 다른 사용자로 로그인 (권한 없는 사용자)
            const testUser = generateTestUser('no-permission');
            // 실제 테스트에서는 권한 없는 사용자 계정 사용

            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 수정/삭제 버튼이 보이지 않아야 함
                const editButton = page.locator('button:has-text("수정"), .edit-button');
                const deleteButton = page.locator('button:has-text("삭제"), .delete-button');

                expect(await editButton.count()).toBe(0);
                expect(await deleteButton.count()).toBe(0);
            }
        });
    });

    // ========================================
    // 2.5 작품 공유 기능 테스트 (U_41)
    // ========================================
    test.describe('작품 공유 기능 테스트 (U_41)', () => {

        test('작품 URL 공유', async ({ page }) => {
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 공유 버튼 확인
                const shareButton = page.locator('button:has-text("공유"), .share-button');
                if (await shareButton.count() > 0) {
                    await shareButton.click();

                    // 공유 옵션 확인
                    const shareOptions = page.locator('.share-options, .share-modal');
                    if (await shareOptions.count() > 0) {
                        await expect(shareOptions).toBeVisible();
                        await captureScreenshot(page, 'artwork-share-options');
                    }
                }
            }
        });

        test('소셜 미디어 공유 링크', async ({ page }) => {
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 소셜 미디어 공유 버튼들 확인
                const socialButtons = page.locator('.social-share a, .share-social button');
                if (await socialButtons.count() > 0) {
                    const buttonCount = await socialButtons.count();
                    console.log(`소셜 공유 버튼 개수: ${buttonCount}`);

                    // 각 버튼의 링크 확인
                    for (let i = 0; i < buttonCount; i++) {
                        const button = socialButtons.nth(i);
                        const href = await button.getAttribute('href');
                        if (href) {
                            console.log(`공유 링크 ${i + 1}: ${href}`);
                        }
                    }
                }
            }
        });

        test('QR 코드 생성', async ({ page }) => {
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // QR 코드 버튼 확인
                const qrButton = page.locator('button:has-text("QR"), .qr-button');
                if (await qrButton.count() > 0) {
                    await qrButton.click();

                    // QR 코드 이미지 확인
                    const qrCode = page.locator('.qr-code img, canvas');
                    if (await qrCode.count() > 0) {
                        await expect(qrCode).toBeVisible();
                        await captureScreenshot(page, 'artwork-qr-code');
                    }
                }
            }
        });

        test('이메일 공유', async ({ page }) => {
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);

                // 이메일 공유 버튼
                const emailShareButton = page.locator('button:has-text("이메일"), .email-share');
                if (await emailShareButton.count() > 0) {
                    await emailShareButton.click();

                    // 이메일 폼 또는 mailto 링크 확인
                    const emailForm = page.locator('.email-share-form');
                    if (await emailForm.count() > 0) {
                        await expect(emailForm).toBeVisible();
                    }
                }
            }
        });
    });

    // ========================================
    // 2.6 작품 검색 및 필터링 고급 기능
    // ========================================
    test.describe('작품 검색 및 필터링 고급 기능', () => {

        test('카테고리별 필터링', async ({ page }) => {
            await page.goto('/artwork');

            // 카테고리 필터 확인
            const categoryFilter = page.locator('#categoryFilter, .category-filter select');
            if (await categoryFilter.count() > 0) {
                await categoryFilter.selectOption('painting');
                await waitForPageLoad(page);
                await captureScreenshot(page, 'artwork-category-filter');
            }
        });

        test('정렬 기능', async ({ page }) => {
            await page.goto('/artwork');

            // 정렬 옵션 확인
            const sortSelect = page.locator('#sortBy, .sort-select');
            if (await sortSelect.count() > 0) {
                // 최신순 정렬
                await sortSelect.selectOption('newest');
                await waitForPageLoad(page);

                // 인기순 정렬
                await sortSelect.selectOption('popular');
                await waitForPageLoad(page);

                await captureScreenshot(page, 'artwork-sorted');
            }
        });

        test('페이지네이션', async ({ page }) => {
            await page.goto('/artwork');

            // 페이지네이션 확인
            const pagination = page.locator('.pagination, .page-navigation');
            if (await pagination.count() > 0) {
                await expect(pagination).toBeVisible();

                // 다음 페이지 버튼
                const nextButton = page.locator('.pagination .next, .page-next');
                if (await nextButton.count() > 0) {
                    await nextButton.click();
                    await waitForPageLoad(page);
                    await captureScreenshot(page, 'artwork-pagination');
                }
            }
        });

        test('무한 스크롤 (있다면)', async ({ page }) => {
            await page.goto('/artwork');

            // 초기 작품 개수 확인
            const initialArtworkCount = await page.locator('.artwork-item').count();

            // 페이지 하단으로 스크롤
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            // 추가 작품 로드 대기
            await page.waitForTimeout(2000);

            // 작품 개수 증가 확인
            const newArtworkCount = await page.locator('.artwork-item').count();

            if (newArtworkCount > initialArtworkCount) {
                console.log('✅ 무한 스크롤 작동');
                await captureScreenshot(page, 'artwork-infinite-scroll');
            }
        });
    });

    // ========================================
    // 2.7 반응형 디자인 테스트
    // ========================================
    test.describe('작품 페이지 반응형 디자인', () => {

        test('모바일 뷰포트에서 작품 목록', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/artwork');

            // 모바일에서 작품 그리드 확인
            const artworkGrid = page.locator('.artwork-grid');
            await expect(artworkGrid).toBeVisible();
            await captureScreenshot(page, 'artwork-mobile-list');
        });

        test('태블릿 뷰포트에서 작품 상세', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/artwork');

            const firstArtwork = page.locator('.artwork-item').first();
            if (await firstArtwork.count() > 0) {
                await firstArtwork.click();
                await waitForPageLoad(page);
                await captureScreenshot(page, 'artwork-tablet-detail');
            }
        });
    });
});
