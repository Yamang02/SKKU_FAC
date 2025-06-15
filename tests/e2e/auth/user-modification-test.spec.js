/**
 * 사용자 데이터 수정/삭제 테스트
 * 사용자 프로필 수정 및 계정 삭제 기능을 검증합니다
 */
import { test, expect } from '@playwright/test';
import { loginAs, logout, clearSession } from '../helpers/simple-login.js';
import { getModifyTestUser, getDeleteTestUser } from '../fixtures/login-users.js';

test.describe('사용자 데이터 수정/삭제 테스트', () => {

    test.beforeEach(async ({ page }) => {
        // 각 테스트 전 세션 초기화
        await clearSession(page);
    });

    test.describe('프로필 수정 테스트', () => {

        test('SKKU 멤버 - 프로필 정보 수정', async ({ page }) => {
            const user = getModifyTestUser('skku');
            console.log(`🔄 [${user.role}] 프로필 수정 테스트 시작: ${user.username}`);

            // 1. 로그인
            await loginAs(page, user);

            // 2. 프로필 페이지로 이동
            await page.goto('http://localhost:3001/user/me');
            await page.waitForLoadState('networkidle');

            // 3. 수정 전 데이터 확인
            console.log('📋 수정 전 프로필 데이터 확인');
            const nameElement = page.locator('#name');
            const departmentElement = page.locator('#department');
            const studentYearElement = page.locator('#studentYear');
            const isClubMemberElement = page.locator('#isClubMember');

            await expect(nameElement).toHaveValue(user.name);
            console.log(`✅ 기존 이름 확인: ${user.name}`);

            // 4. 프로필 수정
            console.log('🔧 프로필 정보 수정 시작');

            // 이름 수정
            await nameElement.clear();
            await nameElement.fill(user.modifyProfile.name);

            // 학과 수정 (select 요소인 경우)
            if (await departmentElement.count() > 0) {
                await departmentElement.selectOption(user.modifyProfile.department);
            }

            // 학번 수정
            if (await studentYearElement.count() > 0) {
                await studentYearElement.clear();
                await studentYearElement.fill(user.modifyProfile.studentYear);
            }

            // 동아리 회원 여부 수정 (체크박스)
            if (await isClubMemberElement.count() > 0) {
                if (user.modifyProfile.isClubMember) {
                    await isClubMemberElement.check();
                } else {
                    await isClubMemberElement.uncheck();
                }
            }

            // 5. 수정 사항 저장
            const saveButton = page.locator('button:has-text("저장"), button:has-text("수정"), button[type="submit"]');
            await saveButton.click();
            await page.waitForTimeout(2000);

            // 6. 수정 결과 확인
            console.log('✅ 수정 완료, 결과 확인');

            // 페이지 새로고침하여 저장된 데이터 확인
            await page.reload();
            await page.waitForLoadState('networkidle');

            // 수정된 데이터 검증
            await expect(nameElement).toHaveValue(user.modifyProfile.name);
            console.log(`✅ 수정된 이름 확인: ${user.modifyProfile.name}`);

            // 7. 로그아웃
            await logout(page);
            console.log(`✅ [${user.role}] 프로필 수정 테스트 완료`);
        });

        test('외부 멤버 - 프로필 정보 수정', async ({ page }) => {
            const user = getModifyTestUser('external');
            console.log(`🔄 [${user.role}] 프로필 수정 테스트 시작: ${user.username}`);

            // 1. 로그인
            await loginAs(page, user);

            // 2. 프로필 페이지로 이동
            await page.goto('http://localhost:3001/user/me');
            await page.waitForLoadState('networkidle');

            // 3. 수정 전 데이터 확인
            console.log('📋 수정 전 프로필 데이터 확인');
            const nameElement = page.locator('#name');
            const affiliationElement = page.locator('#affiliation');

            await expect(nameElement).toHaveValue(user.name);
            console.log(`✅ 기존 이름 확인: ${user.name}`);

            // 4. 프로필 수정
            console.log('🔧 프로필 정보 수정 시작');

            // 이름 수정
            await nameElement.clear();
            await nameElement.fill(user.modifyProfile.name);

            // 소속 기관 수정
            if (await affiliationElement.count() > 0) {
                await affiliationElement.clear();
                await affiliationElement.fill(user.modifyProfile.affiliation);
            }

            // 5. 수정 사항 저장
            const saveButton = page.locator('button:has-text("저장"), button:has-text("수정"), button[type="submit"]');
            await saveButton.click();
            await page.waitForTimeout(2000);

            // 6. 수정 결과 확인
            console.log('✅ 수정 완료, 결과 확인');

            // 페이지 새로고침하여 저장된 데이터 확인
            await page.reload();
            await page.waitForLoadState('networkidle');

            // 수정된 데이터 검증
            await expect(nameElement).toHaveValue(user.modifyProfile.name);
            console.log(`✅ 수정된 이름 확인: ${user.modifyProfile.name}`);

            // 7. 로그아웃
            await logout(page);
            console.log(`✅ [${user.role}] 프로필 수정 테스트 완료`);
        });

    });

    test.describe('계정 삭제 테스트', () => {

        test('SKKU 멤버 - 계정 삭제', async ({ page }) => {
            const user = getDeleteTestUser('skku');
            console.log(`🗑️ [${user.role}] 계정 삭제 테스트 시작: ${user.username}`);

            // 1. 로그인
            await loginAs(page, user);

            // 2. 프로필 페이지로 이동
            await page.goto('http://localhost:3001/user/me');
            await page.waitForLoadState('networkidle');

            // 3. 삭제 전 사용자 정보 확인
            console.log('📋 삭제 전 사용자 정보 확인');
            const usernameElement = page.locator('#username');
            await expect(usernameElement).toHaveText(user.username);
            console.log(`✅ 삭제 대상 사용자 확인: ${user.username}`);

            // 4. 계정 삭제 버튼 찾기 및 클릭
            console.log('🗑️ 계정 삭제 진행');
            const deleteButton = page.locator('button:has-text("계정 삭제"), button:has-text("탈퇴"), .delete-account-btn');

            if (await deleteButton.count() > 0) {
                await deleteButton.click();

                // 확인 대화상자가 있는 경우 처리
                page.on('dialog', async dialog => {
                    console.log(`📢 확인 대화상자: ${dialog.message()}`);
                    await dialog.accept();
                });

                await page.waitForTimeout(3000);

                // 5. 삭제 후 로그인 페이지로 리다이렉트 확인
                const currentUrl = page.url();
                expect(currentUrl).toContain('/user/login');
                console.log('✅ 계정 삭제 후 로그인 페이지로 리다이렉트 확인');

                // 6. 삭제된 계정으로 재로그인 시도 (실패해야 함)
                console.log('🔍 삭제된 계정으로 재로그인 시도');
                await page.fill('#username', user.username);
                await page.fill('#password', user.password);

                const loginButton = page.locator('button[type="submit"]');
                await loginButton.click();
                await page.waitForTimeout(2000);

                // 로그인 실패 확인 (여전히 로그인 페이지에 있어야 함)
                const afterLoginUrl = page.url();
                expect(afterLoginUrl).toContain('/user/login');
                console.log('✅ 삭제된 계정으로 로그인 실패 확인');

            } else {
                console.log('⚠️ 계정 삭제 버튼을 찾을 수 없음');
                throw new Error('계정 삭제 버튼을 찾을 수 없습니다');
            }

            console.log(`✅ [${user.role}] 계정 삭제 테스트 완료`);
        });

        test('외부 멤버 - 계정 삭제', async ({ page }) => {
            const user = getDeleteTestUser('external');
            console.log(`🗑️ [${user.role}] 계정 삭제 테스트 시작: ${user.username}`);

            // 1. 로그인
            await loginAs(page, user);

            // 2. 프로필 페이지로 이동
            await page.goto('http://localhost:3001/user/me');
            await page.waitForLoadState('networkidle');

            // 3. 삭제 전 사용자 정보 확인
            console.log('📋 삭제 전 사용자 정보 확인');
            const usernameElement = page.locator('#username');
            await expect(usernameElement).toHaveText(user.username);
            console.log(`✅ 삭제 대상 사용자 확인: ${user.username}`);

            // 4. 계정 삭제 버튼 찾기 및 클릭
            console.log('🗑️ 계정 삭제 진행');
            const deleteButton = page.locator('button:has-text("계정 삭제"), button:has-text("탈퇴"), .delete-account-btn');

            if (await deleteButton.count() > 0) {
                await deleteButton.click();

                // 확인 대화상자가 있는 경우 처리
                page.on('dialog', async dialog => {
                    console.log(`📢 확인 대화상자: ${dialog.message()}`);
                    await dialog.accept();
                });

                await page.waitForTimeout(3000);

                // 5. 삭제 후 로그인 페이지로 리다이렉트 확인
                const currentUrl = page.url();
                expect(currentUrl).toContain('/user/login');
                console.log('✅ 계정 삭제 후 로그인 페이지로 리다이렉트 확인');

                // 6. 삭제된 계정으로 재로그인 시도 (실패해야 함)
                console.log('🔍 삭제된 계정으로 재로그인 시도');
                await page.fill('#username', user.username);
                await page.fill('#password', user.password);

                const loginButton = page.locator('button[type="submit"]');
                await loginButton.click();
                await page.waitForTimeout(2000);

                // 로그인 실패 확인 (여전히 로그인 페이지에 있어야 함)
                const afterLoginUrl = page.url();
                expect(afterLoginUrl).toContain('/user/login');
                console.log('✅ 삭제된 계정으로 로그인 실패 확인');

            } else {
                console.log('⚠️ 계정 삭제 버튼을 찾을 수 없음');
                throw new Error('계정 삭제 버튼을 찾을 수 없습니다');
            }

            console.log(`✅ [${user.role}] 계정 삭제 테스트 완료`);
        });

    });

    test.describe('통합 테스트', () => {

        test('프로필 수정 후 계정 삭제 플로우', async ({ page }) => {
            // 이 테스트는 별도의 테스트 사용자가 필요하므로 스킵하거나
            // 테스트 데이터 초기화 후 실행해야 함
            test.skip('통합 테스트는 별도 테스트 데이터 준비 후 실행');
        });

    });

});
