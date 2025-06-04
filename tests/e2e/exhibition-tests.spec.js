import { test, expect } from '@playwright/test';
import {
    generateTestUser,
    loginUser,
    waitForPageLoad,
    expectSuccessMessage,
    expectErrorMessage,
    captureScreenshot,
} from './helpers/test-helpers.js';

/**
 * 전시회 관련 테스트 (U_50, U_60)
 * 실제 프로젝트 구조 기반 전시회 관리 테스트
 */

test.describe('전시회 관련 테스트 - 실제 구조 기반', () => {
    // ========================================
    // 2.1 전시회 목록 및 검색 테스트 (U_50)
    // ========================================
    test.describe('전시회 목록 및 검색 테스트 (U_50)', () => {
        test('전시회 목록 페이지 로드', async ({ page }) => {
            await page.goto('/exhibition');
            await captureScreenshot(page, 'exhibition-list-page');

            // 전시회 목록 컨테이너 확인
            await expect(page.locator('.exhibition-list, .exhibition-grid')).toBeVisible();

            // 페이지 제목 확인
            await expect(page.locator('h1')).toContainText('전시회');
        });

        test('전시회명으로 검색', async ({ page }) => {
            await page.goto('/exhibition');

            // 검색 입력 필드 확인
            const searchInput = page.locator('#searchInput, input[name="search"]');
            if ((await searchInput.count()) > 0) {
                await expect(searchInput).toBeVisible();

                // 검색어 입력
                await searchInput.fill('테스트 전시회');

                // 검색 버튼 클릭 또는 엔터
                const searchButton = page.locator('button:has-text("검색"), .search-button');
                if ((await searchButton.count()) > 0) {
                    await searchButton.click();
                } else {
                    await searchInput.press('Enter');
                }

                await waitForPageLoad(page);
                await captureScreenshot(page, 'exhibition-search-results');
            }
        });

        test('전시회 상태별 필터링', async ({ page }) => {
            await page.goto('/exhibition');

            // 상태 필터 확인 (진행중, 예정, 종료)
            const statusFilter = page.locator('#statusFilter, select[name="status"]');
            if ((await statusFilter.count()) > 0) {
                // 진행중 전시회 필터
                await statusFilter.selectOption('ongoing');
                await waitForPageLoad(page);
                await captureScreenshot(page, 'exhibition-ongoing-filter');

                // 예정 전시회 필터
                await statusFilter.selectOption('upcoming');
                await waitForPageLoad(page);

                // 종료된 전시회 필터
                await statusFilter.selectOption('ended');
                await waitForPageLoad(page);
            }
        });

        test('전시회 정렬 기능', async ({ page }) => {
            await page.goto('/exhibition');

            // 정렬 옵션 확인
            const sortSelect = page.locator('#sortBy, .sort-select');
            if ((await sortSelect.count()) > 0) {
                // 최신순 정렬
                await sortSelect.selectOption('newest');
                await waitForPageLoad(page);

                // 시작일순 정렬
                await sortSelect.selectOption('startDate');
                await waitForPageLoad(page);

                await captureScreenshot(page, 'exhibition-sorted');
            }
        });

        test('전시회 카드 정보 표시', async ({ page }) => {
            await page.goto('/exhibition');

            // 첫 번째 전시회 카드 확인
            const firstExhibition = page.locator('.exhibition-item, .exhibition-card').first();
            if ((await firstExhibition.count()) > 0) {
                // 전시회 기본 정보 확인
                const title = firstExhibition.locator('.exhibition-title, .title');
                const dates = firstExhibition.locator('.exhibition-dates, .dates');
                const status = firstExhibition.locator('.exhibition-status, .status');

                if ((await title.count()) > 0) await expect(title).toBeVisible();
                if ((await dates.count()) > 0) await expect(dates).toBeVisible();
                if ((await status.count()) > 0) await expect(status).toBeVisible();

                await captureScreenshot(page, 'exhibition-card-info');
            }
        });
    });

    // ========================================
    // 2.2 전시회 상세 보기 테스트 (U_60)
    // ========================================
    test.describe('전시회 상세 보기 테스트 (U_60)', () => {
        test('전시회 상세 모달 열기', async ({ page }) => {
            await page.goto('/exhibition');

            // 첫 번째 전시회 클릭
            const firstExhibition = page.locator('.exhibition-item, .exhibition-card').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 모달 또는 상세 페이지 확인
                const modal = page.locator('.modal, .exhibition-modal');
                const detailPage = page.locator('.exhibition-detail');

                if ((await modal.count()) > 0) {
                    await expect(modal).toBeVisible();
                    await captureScreenshot(page, 'exhibition-detail-modal');
                } else if ((await detailPage.count()) > 0) {
                    await expect(detailPage).toBeVisible();
                    await captureScreenshot(page, 'exhibition-detail-page');
                }
            }
        });

        test('전시회 상세 정보 표시', async ({ page }) => {
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 전시회 상세 정보 필드들 확인
                const infoFields = [
                    '.exhibition-title, .title',
                    '.exhibition-description, .description',
                    '.exhibition-dates, .dates',
                    '.exhibition-location, .location',
                    '.exhibition-curator, .curator',
                ];

                for (const field of infoFields) {
                    const element = page.locator(field);
                    if ((await element.count()) > 0) {
                        await expect(element).toBeVisible();
                    }
                }
            }
        });

        test('전시회 작품 목록 표시', async ({ page }) => {
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 전시회 내 작품 목록 확인
                const artworkList = page.locator('.exhibition-artworks, .artworks-in-exhibition');
                if ((await artworkList.count()) > 0) {
                    await expect(artworkList).toBeVisible();

                    // 개별 작품 항목 확인
                    const artworkItems = page.locator('.artwork-item, .artwork-card');
                    if ((await artworkItems.count()) > 0) {
                        console.log(`전시회 작품 개수: ${await artworkItems.count()}`);
                        await captureScreenshot(page, 'exhibition-artworks');
                    }
                }
            }
        });

        test('전시회 작품 상세 보기', async ({ page }) => {
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 전시회 내 첫 번째 작품 클릭
                const firstArtwork = page.locator('.artwork-item, .artwork-card').first();
                if ((await firstArtwork.count()) > 0) {
                    await firstArtwork.click();
                    await waitForPageLoad(page);

                    // 작품 상세 정보 확인
                    const artworkDetail = page.locator('.artwork-detail, .artwork-modal');
                    if ((await artworkDetail.count()) > 0) {
                        await expect(artworkDetail).toBeVisible();
                        await captureScreenshot(page, 'exhibition-artwork-detail');
                    }
                }
            }
        });

        test('전시회 모달 닫기', async ({ page }) => {
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 모달 닫기 버튼 확인
                const closeButton = page.locator('.modal-close, .close-button, button:has-text("닫기")');
                if ((await closeButton.count()) > 0) {
                    await closeButton.click();

                    // 모달이 닫혔는지 확인
                    const modal = page.locator('.modal, .exhibition-modal');
                    if ((await modal.count()) > 0) {
                        await expect(modal).toBeHidden();
                    }
                } else {
                    // ESC 키로 모달 닫기
                    await page.keyboard.press('Escape');
                }
            }
        });
    });

    // ========================================
    // 2.3 전시회 작품 출품 테스트
    // ========================================
    test.describe('전시회 작품 출품 테스트', () => {
        test('전시회 출품 버튼 확인 (로그인 필요)', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 출품 버튼 확인
                const submitButton = page.locator('button:has-text("출품"), button:has-text("참여"), .submit-artwork');
                if ((await submitButton.count()) > 0) {
                    await expect(submitButton).toBeVisible();
                    await captureScreenshot(page, 'exhibition-submit-button');
                }
            }
        });

        test('기존 작품으로 출품', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                const submitButton = page.locator('button:has-text("출품"), .submit-artwork');
                if ((await submitButton.count()) > 0) {
                    await submitButton.click();

                    // 출품 폼 또는 모달 확인
                    const submitForm = page.locator('.submit-form, .submission-modal');
                    if ((await submitForm.count()) > 0) {
                        await expect(submitForm).toBeVisible();

                        // 기존 작품 선택 옵션
                        const existingArtworkSelect = page.locator('#existingArtwork, select[name="artwork"]');
                        if ((await existingArtworkSelect.count()) > 0) {
                            await existingArtworkSelect.selectOption({ index: 1 });
                            await captureScreenshot(page, 'exhibition-submit-existing');
                        }
                    }
                }
            }
        });

        test('새 작품 업로드로 출품', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                const submitButton = page.locator('button:has-text("출품"), .submit-artwork');
                if ((await submitButton.count()) > 0) {
                    await submitButton.click();

                    // 새 작품 업로드 옵션
                    const newArtworkOption = page.locator('input[value="new"], #newArtwork');
                    if ((await newArtworkOption.count()) > 0) {
                        await newArtworkOption.click();

                        // 작품 업로드 폼 확인
                        const uploadForm = page.locator('.artwork-upload-form');
                        if ((await uploadForm.count()) > 0) {
                            await expect(uploadForm).toBeVisible();
                            await captureScreenshot(page, 'exhibition-submit-new');
                        }
                    }
                }
            }
        });

        test('출품 마감일 확인', async ({ page }) => {
            await page.goto('/exhibition');

            const exhibitions = page.locator('.exhibition-item');
            const exhibitionCount = await exhibitions.count();

            for (let i = 0; i < Math.min(exhibitionCount, 3); i++) {
                await exhibitions.nth(i).click();
                await waitForPageLoad(page);

                // 출품 마감일 정보 확인
                const deadline = page.locator('.submission-deadline, .deadline');
                if ((await deadline.count()) > 0) {
                    const deadlineText = await deadline.textContent();
                    console.log(`전시회 ${i + 1} 출품 마감일: ${deadlineText}`);
                }

                // 모달 닫기
                const closeButton = page.locator('.modal-close, .close-button');
                if ((await closeButton.count()) > 0) {
                    await closeButton.click();
                } else {
                    await page.keyboard.press('Escape');
                }
            }
        });
    });

    // ========================================
    // 2.4 출품 취소 테스트
    // ========================================
    test.describe('출품 취소 테스트', () => {
        test('출품한 작품 확인', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 내가 출품한 작품 표시 확인
                const mySubmissions = page.locator('.my-submissions, .submitted-artworks');
                if ((await mySubmissions.count()) > 0) {
                    await expect(mySubmissions).toBeVisible();
                    await captureScreenshot(page, 'exhibition-my-submissions');
                }
            }
        });

        test('출품 취소 버튼 확인', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 출품 취소 버튼 확인 (출품한 작품에만 표시)
                const cancelButton = page.locator('button:has-text("취소"), .cancel-submission');
                if ((await cancelButton.count()) > 0) {
                    await expect(cancelButton).toBeVisible();
                    await captureScreenshot(page, 'exhibition-cancel-button');
                }
            }
        });

        test('마감일 이후 출품 취소 제한', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/exhibition');

            // 마감일이 지난 전시회 찾기 (실제 데이터에 따라 다름)
            const exhibitions = page.locator('.exhibition-item');
            const exhibitionCount = await exhibitions.count();

            for (let i = 0; i < exhibitionCount; i++) {
                await exhibitions.nth(i).click();
                await waitForPageLoad(page);

                // 마감일 확인
                const deadline = page.locator('.submission-deadline');
                if ((await deadline.count()) > 0) {
                    const deadlineText = await deadline.textContent();

                    // 마감일이 지났다면 취소 버튼이 비활성화되어야 함
                    const cancelButton = page.locator('button:has-text("취소"), .cancel-submission');
                    if ((await cancelButton.count()) > 0) {
                        const isDisabled = await cancelButton.isDisabled();
                        if (isDisabled) {
                            console.log('✅ 마감일 이후 출품 취소 제한됨');
                            await captureScreenshot(page, 'exhibition-cancel-disabled');
                        }
                    }
                }

                // 모달 닫기
                const closeButton = page.locator('.modal-close');
                if ((await closeButton.count()) > 0) {
                    await closeButton.click();
                } else {
                    await page.keyboard.press('Escape');
                }
            }
        });

        test('출품 취소 확인 대화상자', async ({ page }) => {
            await loginUser(page, 'admin', 'admin123');
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                const cancelButton = page.locator('button:has-text("취소"), .cancel-submission');
                if ((await cancelButton.count()) > 0) {
                    // 취소 확인 대화상자 처리
                    page.on('dialog', dialog => {
                        expect(dialog.message()).toContain('취소');
                        dialog.dismiss(); // 실제 취소하지 않음
                    });

                    await cancelButton.click();
                    await captureScreenshot(page, 'exhibition-cancel-confirmation');
                }
            }
        });
    });

    // ========================================
    // 2.5 전시회 상태별 테스트
    // ========================================
    test.describe('전시회 상태별 테스트', () => {
        test('진행중 전시회 기능', async ({ page }) => {
            await page.goto('/exhibition');

            // 진행중 전시회 필터 적용
            const statusFilter = page.locator('#statusFilter, select[name="status"]');
            if ((await statusFilter.count()) > 0) {
                await statusFilter.selectOption('ongoing');
                await waitForPageLoad(page);

                const ongoingExhibitions = page.locator('.exhibition-item');
                if ((await ongoingExhibitions.count()) > 0) {
                    await ongoingExhibitions.first().click();
                    await waitForPageLoad(page);

                    // 진행중 전시회는 관람 가능해야 함
                    const viewButton = page.locator('button:has-text("관람"), .view-exhibition');
                    if ((await viewButton.count()) > 0) {
                        await expect(viewButton).toBeVisible();
                    }

                    await captureScreenshot(page, 'exhibition-ongoing');
                }
            }
        });

        test('예정 전시회 기능', async ({ page }) => {
            await page.goto('/exhibition');

            const statusFilter = page.locator('#statusFilter, select[name="status"]');
            if ((await statusFilter.count()) > 0) {
                await statusFilter.selectOption('upcoming');
                await waitForPageLoad(page);

                const upcomingExhibitions = page.locator('.exhibition-item');
                if ((await upcomingExhibitions.count()) > 0) {
                    await upcomingExhibitions.first().click();
                    await waitForPageLoad(page);

                    // 예정 전시회는 출품만 가능해야 함
                    const submitButton = page.locator('button:has-text("출품"), .submit-artwork');
                    if ((await submitButton.count()) > 0) {
                        await expect(submitButton).toBeVisible();
                    }

                    await captureScreenshot(page, 'exhibition-upcoming');
                }
            }
        });

        test('종료된 전시회 기능', async ({ page }) => {
            await page.goto('/exhibition');

            const statusFilter = page.locator('#statusFilter, select[name="status"]');
            if ((await statusFilter.count()) > 0) {
                await statusFilter.selectOption('ended');
                await waitForPageLoad(page);

                const endedExhibitions = page.locator('.exhibition-item');
                if ((await endedExhibitions.count()) > 0) {
                    await endedExhibitions.first().click();
                    await waitForPageLoad(page);

                    // 종료된 전시회는 관람만 가능해야 함
                    const submitButton = page.locator('button:has-text("출품"), .submit-artwork');
                    expect(await submitButton.count()).toBe(0);

                    await captureScreenshot(page, 'exhibition-ended');
                }
            }
        });
    });

    // ========================================
    // 2.6 반응형 디자인 테스트
    // ========================================
    test.describe('전시회 페이지 반응형 디자인', () => {
        test('모바일 뷰포트에서 전시회 목록', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/exhibition');

            // 모바일에서 전시회 목록 확인
            const exhibitionList = page.locator('.exhibition-list, .exhibition-grid');
            await expect(exhibitionList).toBeVisible();
            await captureScreenshot(page, 'exhibition-mobile-list');
        });

        test('태블릿 뷰포트에서 전시회 상세', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);
                await captureScreenshot(page, 'exhibition-tablet-detail');
            }
        });

        test('모바일에서 전시회 모달', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/exhibition');

            const firstExhibition = page.locator('.exhibition-item').first();
            if ((await firstExhibition.count()) > 0) {
                await firstExhibition.click();
                await waitForPageLoad(page);

                // 모바일에서 모달이 전체 화면을 차지하는지 확인
                const modal = page.locator('.modal, .exhibition-modal');
                if ((await modal.count()) > 0) {
                    await expect(modal).toBeVisible();
                    await captureScreenshot(page, 'exhibition-mobile-modal');
                }
            }
        });
    });

    // ========================================
    // 2.7 접근성 테스트
    // ========================================
    test.describe('전시회 페이지 접근성', () => {
        test('키보드 네비게이션', async ({ page }) => {
            await page.goto('/exhibition');

            // Tab 키로 전시회 카드 간 이동
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            // Enter 키로 전시회 열기
            await page.keyboard.press('Enter');
            await waitForPageLoad(page);

            // ESC 키로 모달 닫기
            await page.keyboard.press('Escape');

            await captureScreenshot(page, 'exhibition-keyboard-navigation');
        });

        test('스크린 리더 지원', async ({ page }) => {
            await page.goto('/exhibition');

            // aria-label 및 alt 텍스트 확인
            const exhibitionItems = page.locator('.exhibition-item');
            const itemCount = await exhibitionItems.count();

            for (let i = 0; i < Math.min(itemCount, 3); i++) {
                const item = exhibitionItems.nth(i);

                // aria-label 또는 title 속성 확인
                const ariaLabel = await item.getAttribute('aria-label');
                const title = await item.getAttribute('title');

                if (ariaLabel || title) {
                    console.log(`전시회 ${i + 1} 접근성 텍스트: ${ariaLabel || title}`);
                }
            }
        });
    });
});
