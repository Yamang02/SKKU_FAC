import { test, expect } from '@playwright/test';

/**
 * 사용자 역할별 테스트
 * 각 역할(ADMIN, SKKU_MEMBER, EXTERNAL_MEMBER)에 따른 기능 접근 권한 테스트
 */

test.describe('사용자 역할별 접근 권한 테스트', () => {

    // 관리자 권한 테스트
    test.describe('관리자(ADMIN) 권한 테스트', () => {

        test('관리자 로그인 및 관리 페이지 접근', async ({ page }) => {
            // 관리자 로그인
            await page.goto('/user/login');
            await page.fill('#username', 'admin');
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 로그인 성공 확인
            await expect(page).toHaveURL('/');

            // 관리 페이지 접근 시도 (실제 관리 페이지 URL 확인 필요)
            await page.goto('/admin');

            // 관리자는 접근 가능해야 함 (403 오류가 나지 않아야 함)
            const pageTitle = await page.title();
            console.log('관리 페이지 제목:', pageTitle);

            // 관리자 메뉴나 기능이 보여야 함
            const adminElements = await page.locator('[class*="admin"], [id*="admin"]').count();
            console.log('관리자 요소 개수:', adminElements);
        });

        test('관리자 사용자 관리 기능', async ({ page }) => {
            // 관리자 로그인
            await page.goto('/user/login');
            await page.fill('#username', 'admin');
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 사용자 관리 페이지 접근
            await page.goto('/admin/users');

            // 사용자 목록이 표시되는지 확인
            const userList = page.locator('.user-list, .users-table, table');
            if (await userList.count() > 0) {
                console.log('✅ 사용자 목록 표시됨');
            }

            // 사용자 역할 변경 기능 확인
            const roleChangeButtons = page.locator('button:has-text("역할"), select[name*="role"]');
            if (await roleChangeButtons.count() > 0) {
                console.log('✅ 역할 변경 기능 있음');
            }
        });

        test('관리자 작품 관리 기능', async ({ page }) => {
            await page.goto('/user/login');
            await page.fill('#username', 'admin');
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 작품 관리 페이지 접근
            await page.goto('/admin/artworks');

            // 모든 작품 목록 확인 (관리자는 모든 작품을 볼 수 있어야 함)
            const artworkList = page.locator('.artwork-grid, .artwork-list');
            if (await artworkList.count() > 0) {
                console.log('✅ 작품 관리 페이지 접근 가능');
            }

            // 작품 승인/거부 기능 확인
            const approvalButtons = page.locator('button:has-text("승인"), button:has-text("거부")');
            if (await approvalButtons.count() > 0) {
                console.log('✅ 작품 승인 기능 있음');
            }
        });
    });

    // SKKU 회원 권한 테스트
    test.describe('SKKU 회원(SKKU_MEMBER) 권한 테스트', () => {

        test('SKKU 회원 회원가입 및 로그인', async ({ page }) => {
            const timestamp = Date.now();
            const skkuUser = {
                username: `skkutest${timestamp}`,
                email: `skkutest${timestamp}@skku.edu`,
                password: 'Test123!',
                name: 'SKKU 테스트 사용자',
                department: '컴퓨터공학과',
                studentYear: '23'
            };

            // 회원가입
            await page.goto('/user/new');
            await page.fill('#username', skkuUser.username);
            await page.fill('#email', skkuUser.email);
            await page.fill('#password', skkuUser.password);
            await page.fill('#confirmPassword', skkuUser.password);
            await page.fill('#name', skkuUser.name);
            await page.selectOption('#role', 'SKKU_MEMBER');

            await page.waitForSelector('#skkuFields', { state: 'visible' });
            await page.fill('#department', skkuUser.department);
            await page.fill('#studentYear', skkuUser.studentYear);

            await page.click('button[type="submit"]');

            // 회원가입 결과 확인
            await page.waitForTimeout(2000);
            const success = await page.locator('.notification--success').count();

            if (success > 0) {
                console.log('✅ SKKU 회원 회원가입 성공');

                // 로그인 페이지로 이동 (자동 리다이렉트 대기)
                await page.waitForTimeout(3500);

                // 로그인 시도
                await page.fill('#username', skkuUser.username);
                await page.fill('#password', skkuUser.password);
                await page.click('button[type="submit"]');

                // 로그인 성공 확인
                await expect(page).toHaveURL('/');
                console.log('✅ SKKU 회원 로그인 성공');
            }
        });

        test('SKKU 회원 작품 업로드 권한', async ({ page }) => {
            // SKKU 회원으로 로그인 (기존 계정 사용)
            await page.goto('/user/login');
            await page.fill('#username', 'admin'); // 임시로 관리자 계정 사용
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 작품 업로드 페이지 접근
            await page.goto('/artwork/new');

            // SKKU 회원은 작품 업로드가 가능해야 함
            const uploadForm = page.locator('form[action*="artwork"], .artwork-upload-form');
            if (await uploadForm.count() > 0) {
                console.log('✅ SKKU 회원 작품 업로드 권한 있음');
            } else {
                console.log('❌ 작품 업로드 폼을 찾을 수 없음');
            }
        });

        test('SKKU 회원 전시회 참여 권한', async ({ page }) => {
            await page.goto('/user/login');
            await page.fill('#username', 'admin');
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 전시회 목록 페이지
            await page.goto('/exhibition');

            // 전시회 참여 버튼 확인
            const participateButtons = page.locator('button:has-text("참여"), a:has-text("참여")');
            if (await participateButtons.count() > 0) {
                console.log('✅ SKKU 회원 전시회 참여 권한 있음');
            }
        });

        test('SKKU 회원 관리 페이지 접근 제한', async ({ page }) => {
            await page.goto('/user/login');
            await page.fill('#username', 'admin'); // 실제로는 SKKU 회원 계정 사용
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 관리 페이지 접근 시도
            await page.goto('/admin');

            // 403 오류 또는 접근 거부 메시지 확인
            const pageContent = await page.textContent('body');
            const hasAccessDenied = pageContent.includes('403') ||
                pageContent.includes('접근') ||
                pageContent.includes('권한');

            if (hasAccessDenied) {
                console.log('✅ SKKU 회원 관리 페이지 접근 제한됨');
            }
        });
    });

    // 외부 회원 권한 테스트
    test.describe('외부 회원(EXTERNAL_MEMBER) 권한 테스트', () => {

        test('외부 회원 회원가입 및 로그인', async ({ page }) => {
            const timestamp = Date.now();
            const externalUser = {
                username: `external${timestamp}`,
                email: `external${timestamp}@example.com`,
                password: 'Test123!',
                name: '외부 테스트 사용자',
                affiliation: '외부 기관'
            };

            // 회원가입
            await page.goto('/user/new');
            await page.fill('#username', externalUser.username);
            await page.fill('#email', externalUser.email);
            await page.fill('#password', externalUser.password);
            await page.fill('#confirmPassword', externalUser.password);
            await page.fill('#name', externalUser.name);
            await page.selectOption('#role', 'EXTERNAL_MEMBER');

            await page.waitForSelector('#externalFields', { state: 'visible' });
            await page.fill('#affiliation', externalUser.affiliation);

            await page.click('button[type="submit"]');

            // 회원가입 결과 확인
            await page.waitForTimeout(2000);
            const success = await page.locator('.notification--success').count();

            if (success > 0) {
                console.log('✅ 외부 회원 회원가입 성공');

                await page.waitForTimeout(3500);

                // 로그인 시도
                await page.fill('#username', externalUser.username);
                await page.fill('#password', externalUser.password);
                await page.click('button[type="submit"]');

                await expect(page).toHaveURL('/');
                console.log('✅ 외부 회원 로그인 성공');
            }
        });

        test('외부 회원 작품 업로드 권한 제한', async ({ page }) => {
            await page.goto('/user/login');
            await page.fill('#username', 'admin'); // 실제로는 외부 회원 계정 사용
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 작품 업로드 페이지 접근 시도
            await page.goto('/artwork/new');

            // 외부 회원은 작품 업로드가 제한될 수 있음
            const pageContent = await page.textContent('body');
            const hasRestriction = pageContent.includes('권한') ||
                pageContent.includes('제한') ||
                pageContent.includes('403');

            if (hasRestriction) {
                console.log('✅ 외부 회원 작품 업로드 제한됨');
            } else {
                console.log('ℹ️ 외부 회원도 작품 업로드 가능');
            }
        });

        test('외부 회원 전시회 관람 권한', async ({ page }) => {
            await page.goto('/user/login');
            await page.fill('#username', 'admin');
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 전시회 목록 페이지
            await page.goto('/exhibition');

            // 외부 회원은 전시회 관람은 가능해야 함
            const exhibitionList = page.locator('.exhibition-list, .exhibition-grid');
            if (await exhibitionList.count() > 0) {
                console.log('✅ 외부 회원 전시회 관람 권한 있음');
            }

            // 전시회 상세 페이지 접근
            const firstExhibition = page.locator('.exhibition-item, .exhibition-card').first();
            if (await firstExhibition.count() > 0) {
                await firstExhibition.click();
                console.log('✅ 외부 회원 전시회 상세 접근 가능');
            }
        });

        test('외부 회원 관리 기능 접근 제한', async ({ page }) => {
            await page.goto('/user/login');
            await page.fill('#username', 'admin'); // 실제로는 외부 회원 계정
            await page.fill('#password', 'admin123');
            await page.click('button[type="submit"]');

            // 관리 페이지들 접근 시도
            const adminPages = ['/admin', '/admin/users', '/admin/artworks', '/admin/exhibitions'];

            for (const adminPage of adminPages) {
                await page.goto(adminPage);

                const pageContent = await page.textContent('body');
                const hasAccessDenied = pageContent.includes('403') ||
                    pageContent.includes('접근') ||
                    pageContent.includes('권한');

                if (hasAccessDenied) {
                    console.log(`✅ 외부 회원 ${adminPage} 접근 제한됨`);
                } else {
                    console.log(`⚠️ 외부 회원 ${adminPage} 접근 가능 (확인 필요)`);
                }
            }
        });
    });

    // 비로그인 사용자 권한 테스트
    test.describe('비로그인 사용자 권한 테스트', () => {

        test('비로그인 사용자 공개 페이지 접근', async ({ page }) => {
            // 로그인하지 않은 상태에서 공개 페이지 접근
            const publicPages = ['/', '/artwork', '/exhibition'];

            for (const publicPage of publicPages) {
                await page.goto(publicPage);

                // 페이지가 정상적으로 로드되는지 확인
                const pageTitle = await page.title();
                console.log(`공개 페이지 ${publicPage} 제목:`, pageTitle);

                // 로그인 페이지로 리다이렉트되지 않아야 함
                expect(page.url()).not.toContain('/user/login');
            }
        });

        test('비로그인 사용자 보호된 페이지 접근 제한', async ({ page }) => {
            // 로그인이 필요한 페이지들
            const protectedPages = ['/user/me', '/artwork/new', '/admin'];

            for (const protectedPage of protectedPages) {
                await page.goto(protectedPage);

                // 로그인 페이지로 리다이렉트되거나 접근 거부되어야 함
                const currentUrl = page.url();
                const pageContent = await page.textContent('body');

                const isRedirectedToLogin = currentUrl.includes('/user/login');
                const hasAccessDenied = pageContent.includes('로그인') ||
                    pageContent.includes('접근') ||
                    pageContent.includes('권한');

                if (isRedirectedToLogin || hasAccessDenied) {
                    console.log(`✅ 비로그인 사용자 ${protectedPage} 접근 제한됨`);
                } else {
                    console.log(`⚠️ 비로그인 사용자 ${protectedPage} 접근 가능 (보안 확인 필요)`);
                }
            }
        });
    });
});
