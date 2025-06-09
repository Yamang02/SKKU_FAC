/**
 * ???? ??? ? ??? ?? ? ???? ??? ???
 * ? ??? ?? ????? ?? ??? ?? ??
 */
import { test, expect } from '@playwright/test';

// ??? ??? ???
const testUsers = [
    {
        username: 'admin',
        email: 'skkfntclbdmnsttrt@gmail.com',
        password: '1234',
        role: 'ADMIN'
    },
    {
        username: 'duplicate1749455784069',
        email: 'duplicate1749455784069@skku.edu',
        password: '1234',
        role: 'SKKU_MEMBER'
    },
    {
        username: 'external1749455846376',
        email: 'external1749455846376@example.com',
        password: '1234',
        role: 'EXTERNAL_MEMBER'
    }
];

// ??? ?? ???
async function clearSession(page) {
    try {
        await page.context().clearCookies();
        await page.evaluate(() => {
            try {
                if (typeof localStorage !== 'undefined') localStorage.clear();
                if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
            } catch (e) {
                console.log('Storage clear failed:', e.message);
            }
        });
        console.log('?? ??? ??');
    } catch (error) {
        console.log('?? ??? ??:', error.message);
    }
}

test.describe('???? ??? ?? ??? ???', () => {

    test.beforeEach(async ({ page }) => {
        // ??? ?? ???
        await page.context().clearCookies();
    });

    test('??? - ??? ? ??? ? ???? ???', async ({ page }) => {
        const adminUser = testUsers[0]; // admin ???

        console.log('?? [???] ??? ?? ??');

        // 1. ??? ??? ??
        await page.goto('http://localhost:3000/user/login');
        await page.waitForLoadState('networkidle');

        // 2. ??? ?? ??
        await page.fill('#username', adminUser.username);
        await page.fill('#password', adminUser.password);

        // 3. ??? ?? ??
        const loginButton = page.locator('button[type="submit"]');
        await loginButton.click();

        // 4. ??? ?? ??
        await page.waitForTimeout(3000);
        const afterLoginUrl = page.url();
        expect(afterLoginUrl).not.toContain('/user/login');
        console.log('? [???] ??? ??');

        // 5. ??? ??? ??
        console.log('?? [???] ??? ?? ??');
        await page.goto('http://localhost:3000/user/me');
        await page.waitForLoadState('networkidle');

        // 6. ??? ??? ?? ??
        const profileUrl = page.url();
        expect(profileUrl).toContain('/user/me');

        // 7. ??? ?? ?? ?? (JavaScript? ?? ?? ??)
        const profileContainer = page.locator('.profile-container');
        await expect(profileContainer).toBeVisible();

        // ??? ???? ??? ??? ?? (username ??? ??? ???)
        const usernameElement = page.locator('#username');
        await expect(usernameElement).toHaveText('admin', { timeout: 10000 });
        console.log('? [???] ??? ??? ? ??? ?? ??');

        // 8. ???? ??
        console.log('?? [???] ???? ??');
        const logoutElement = page.locator('#logout-btn');

        if (await logoutElement.count() > 0) {
            await logoutElement.click();
            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(2000);
            const afterLogoutUrl = page.url();
            expect(afterLogoutUrl).toContain('/user/login');
            console.log('? [???] ???? ??');
        } else {
            console.log('?? [???] ???? ??? ?? ? ??');
        }
    });

    test('SKKU ?? - ??? ? ??? ? ???? ???', async ({ page }) => {
        const skkuUser = testUsers[1]; // SKKU ??

        console.log('?? [SKKU ??] ??? ?? ??');

        await page.goto('http://localhost:3000/user/login');
        await page.waitForLoadState('networkidle');

        await page.fill('#username', skkuUser.username);
        await page.fill('#password', skkuUser.password);

        const loginButton = page.locator('button[type="submit"]');
        await loginButton.click();

        await page.waitForTimeout(3000);
        const afterLoginUrl = page.url();
        expect(afterLoginUrl).not.toContain('/user/login');
        console.log('? [SKKU ??] ??? ??');

        console.log('?? [SKKU ??] ??? ?? ??');
        await page.goto('http://localhost:3000/user/me');
        await page.waitForLoadState('networkidle');

        const profileUrl = page.url();
        expect(profileUrl).toContain('/user/me');

        const profileContainer = page.locator('.profile-container');
        await expect(profileContainer).toBeVisible();

        // ??? ???? ??? ??? ??
        const usernameElement = page.locator('#username');
        await expect(usernameElement).toHaveText('duplicate1749455784069', { timeout: 10000 });
        console.log('? [SKKU ??] ??? ??? ? ??? ?? ??');

        console.log('?? [SKKU ??] ???? ??');
        const logoutElement = page.locator('#logout-btn');

        if (await logoutElement.count() > 0) {
            await logoutElement.click();
            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(2000);
            const afterLogoutUrl = page.url();
            expect(afterLogoutUrl).toContain('/user/login');
            console.log('? [SKKU ??] ???? ??');
        } else {
            console.log('?? [SKKU ??] ???? ??? ?? ? ??');
        }
    });

    test('?? ?? - ??? ? ??? ? ???? ???', async ({ page }) => {
        const externalUser = testUsers[2]; // ?? ??

        console.log('?? [?? ??] ??? ?? ??');

        await page.goto('http://localhost:3000/user/login');
        await page.waitForLoadState('networkidle');

        await page.fill('#username', externalUser.username);
        await page.fill('#password', externalUser.password);

        const loginButton = page.locator('button[type="submit"]');
        await loginButton.click();

        await page.waitForTimeout(3000);
        const afterLoginUrl = page.url();
        expect(afterLoginUrl).not.toContain('/user/login');
        console.log('? [?? ??] ??? ??');

        console.log('?? [?? ??] ??? ?? ??');
        await page.goto('http://localhost:3000/user/me');
        await page.waitForLoadState('networkidle');

        const profileUrl = page.url();
        expect(profileUrl).toContain('/user/me');

        const profileContainer = page.locator('.profile-container');
        await expect(profileContainer).toBeVisible();

        // ??? ???? ??? ??? ??
        const usernameElement = page.locator('#username');
        await expect(usernameElement).toHaveText('external1749455846376', { timeout: 10000 });
        console.log('? [?? ??] ??? ??? ? ??? ?? ??');

        console.log('?? [?? ??] ???? ??');
        const logoutElement = page.locator('#logout-btn');

        if (await logoutElement.count() > 0) {
            await logoutElement.click();
            await page.waitForLoadState('networkidle');

            await page.waitForTimeout(2000);
            const afterLogoutUrl = page.url();
            expect(afterLogoutUrl).toContain('/user/login');
            console.log('? [?? ??] ???? ??');
        } else {
            console.log('?? [?? ??] ???? ??? ?? ? ??');
        }
    });

    test('?? ??? ?? ??? ???', async ({ page }) => {
        for (const user of testUsers) {
            console.log(`?? [${user.role}] ?? ??? ??? ??: ${user.username}`);

            // ?? ???
            await page.context().clearCookies();

            try {
                // 1. ???
                await page.goto('http://localhost:3000/user/login');
                await page.waitForLoadState('networkidle');

                await page.fill('#username', user.username);
                await page.fill('#password', user.password);

                const loginButton = page.locator('button[type="submit"]');
                await loginButton.click();

                await page.waitForTimeout(3000);
                const afterLoginUrl = page.url();
                expect(afterLoginUrl).not.toContain('/user/login');
                console.log(`? [${user.role}] ??? ??`);

                // 2. ??? ??
                await page.goto('http://localhost:3000/user/me');
                await page.waitForLoadState('networkidle');

                const profileUrl = page.url();
                expect(profileUrl).toContain('/user/me');
                console.log(`? [${user.role}] ??? ?? ??`);

                // 3. ??? ??? ?? ??
                const profileContainer = page.locator('.profile-container');
                await expect(profileContainer).toBeVisible();

                // ??? ???? ??? ??? ??
                const usernameElement = page.locator('#username');
                await expect(usernameElement).toHaveText(user.username, { timeout: 10000 });

                // 4. ????
                const logoutElement = page.locator('#logout-btn');

                if (await logoutElement.count() > 0) {
                    await logoutElement.click();
                    await page.waitForLoadState('networkidle');

                    await page.waitForTimeout(2000);
                    const afterLogoutUrl = page.url();
                    expect(afterLogoutUrl).toContain('/user/login');
                    console.log(`? [${user.role}] ???? ??`);
                } else {
                    console.log(`?? [${user.role}] ???? ??? ?? ? ??`);
                }

                console.log(`?? [${user.role}] ?? ??? ??\n`);

            } catch (error) {
                console.error(`? [${user.role}] ??? ??? ??:`, error.message);
                throw error;
            }
        }
    });
});
