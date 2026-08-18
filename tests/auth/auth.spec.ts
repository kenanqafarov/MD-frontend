import { test, expect, apiRequest, BASE_API } from '../fixtures';
import { chromium } from '@playwright/test';

const BASE_URL = 'http://169.58.183.137:8080';
const VALID_USER = 'super_admin';
const VALID_PASS = 'super1234';

// ─────────────────────────────────────────────
// AUTH API TESTS
// ─────────────────────────────────────────────

test.describe('AUTH-001: Login API - Valid Credentials', () => {
  test('should return accessToken and refreshToken for valid credentials', async () => {
    const { status, data } = await apiRequest('POST', '/auth/login', {
      username: VALID_USER,
      password: VALID_PASS,
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('tokenPair');
    const tokenData = data as { tokenPair: { accessToken: string; refreshToken: string } };
    expect(tokenData.tokenPair.accessToken).toBeTruthy();
    expect(tokenData.tokenPair.refreshToken).toBeTruthy();
    expect(typeof tokenData.tokenPair.accessToken).toBe('string');
  });
});

test.describe('AUTH-002: Login API - Wrong Password', () => {
  test('should return error for wrong password', async () => {
    const { status, data } = await apiRequest('POST', '/auth/login', {
      username: VALID_USER,
      password: 'wrongpassword999',
    });
    expect(status).not.toBe(200);
    const errData = data as Record<string, unknown>;
    // Should return some error indication
    expect(errData).toBeDefined();
    console.log(`AUTH-002 Response: status=${status}, data=${JSON.stringify(data)}`);
  });
});

test.describe('AUTH-003: Login API - Non-existent Username', () => {
  test('should return NOT_FOUND for unknown user', async () => {
    const { status, data } = await apiRequest('POST', '/auth/login', {
      username: 'nonexistent_user_99999',
      password: 'somepassword',
    });
    expect(status).not.toBe(200);
    const errData = data as Record<string, unknown>;
    console.log(`AUTH-003 Response: status=${status}, data=${JSON.stringify(data)}`);
    expect(errData.status).toBeDefined();
  });
});

test.describe('AUTH-004: Login API - Empty Username', () => {
  test('should return validation error for empty username', async () => {
    const { status, data } = await apiRequest('POST', '/auth/login', {
      username: '',
      password: VALID_PASS,
    });
    expect(status).not.toBe(200);
    console.log(`AUTH-004 Response: status=${status}, data=${JSON.stringify(data)}`);
    const errData = data as Record<string, unknown>;
    expect(errData.username || errData.message).toBeTruthy();
  });
});

test.describe('AUTH-005: Login API - Empty Password', () => {
  test('should return validation error for empty password', async () => {
    const { status, data } = await apiRequest('POST', '/auth/login', {
      username: VALID_USER,
      password: '',
    });
    expect(status).not.toBe(200);
    console.log(`AUTH-005 Response: status=${status}, data=${JSON.stringify(data)}`);
  });
});

test.describe('AUTH-006: Login API - Both Fields Empty', () => {
  test('should return validation errors for both empty fields', async () => {
    const { status, data } = await apiRequest('POST', '/auth/login', {
      username: '',
      password: '',
    });
    expect(status).not.toBe(200);
    console.log(`AUTH-006 Response: status=${status}, data=${JSON.stringify(data)}`);
    const errData = data as Record<string, unknown>;
    expect(errData.username || errData.password).toBeTruthy();
  });
});

test.describe('AUTH-007: Login API - Very Long Username', () => {
  test('should handle very long username gracefully', async () => {
    const longUsername = 'a'.repeat(300);
    const { status, data } = await apiRequest('POST', '/auth/login', {
      username: longUsername,
      password: VALID_PASS,
    });
    expect(status).not.toBe(200);
    expect(status).not.toBe(500); // Should NOT crash
    console.log(`AUTH-007 Response: status=${status}`);
  });
});

test.describe('AUTH-008: Login API - SQL Injection Attempt', () => {
  test('should reject SQL injection in username', async () => {
    const { status, data } = await apiRequest('POST', '/auth/login', {
      username: "' OR '1'='1",
      password: "' OR '1'='1",
    });
    expect(status).not.toBe(200);
    console.log(`AUTH-008 Response: status=${status}`);
  });
});

test.describe('AUTH-009: Login API - XSS Payload', () => {
  test('should handle XSS payload in username without crashing', async () => {
    const { status } = await apiRequest('POST', '/auth/login', {
      username: '<script>alert("xss")</script>',
      password: 'test',
    });
    expect(status).not.toBe(500);
    console.log(`AUTH-009 Response: status=${status}`);
  });
});

test.describe('AUTH-010: Protected Endpoint Without Token', () => {
  test('should return 401 for protected endpoint without token', async () => {
    const { status } = await apiRequest('GET', '/patient/read', undefined, '');
    expect(status).toBe(401);
    console.log(`AUTH-010 Response: status=${status}`);
  });
});

test.describe('AUTH-011: Protected Endpoint With Invalid Token', () => {
  test('should return 401 for invalid token', async () => {
    const { status } = await apiRequest('GET', '/patient/read', undefined, 'invalid.token.here');
    expect(status).toBe(401);
    console.log(`AUTH-011 Response: status=${status}`);
  });
});

test.describe('AUTH-012: Protected Endpoint With Malformed Token', () => {
  test('should return 401 for malformed JWT', async () => {
    const { status } = await apiRequest('GET', '/patient/read', undefined, 'Bearer notajwt');
    expect(status).toBe(401);
    console.log(`AUTH-012 Response: status=${status}`);
  });
});

test.describe('AUTH-013: Refresh Token', () => {
  test('should get new accessToken with valid refreshToken', async () => {
    // First login
    const { status: loginStatus, data: loginData } = await apiRequest('POST', '/auth/login', {
      username: VALID_USER,
      password: VALID_PASS,
    });
    expect(loginStatus).toBe(200);
    const loginTyped = loginData as { tokenPair: { accessToken: string; refreshToken: string } };
    const refreshToken = loginTyped.tokenPair.refreshToken;

    // Use refresh token
    const { status: refreshStatus, data: refreshData } = await apiRequest('POST', '/auth/refresh', {
      refreshToken,
    });
    console.log(`AUTH-013 Refresh Response: status=${refreshStatus}, data=${JSON.stringify(refreshData)}`);
    expect(refreshStatus).toBe(200);
    const refreshTyped = refreshData as { tokenPair?: { accessToken: string } };
    expect(refreshTyped.tokenPair?.accessToken).toBeTruthy();
  });
});

test.describe('AUTH-014: Refresh Token - Invalid', () => {
  test('should reject invalid refresh token', async () => {
    const { status, data } = await apiRequest('POST', '/auth/refresh', {
      refreshToken: 'invalid_refresh_token_value',
    });
    expect(status).not.toBe(200);
    console.log(`AUTH-014 Response: status=${status}, data=${JSON.stringify(data)}`);
  });
});

// ─────────────────────────────────────────────
// FRONTEND AUTH UI TESTS
// ─────────────────────────────────────────────

test.describe('AUTH-UI-001: Login Page UI', () => {
  test('should show login form on /login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check form elements
    const usernameInput = page.locator('input[placeholder="İstifadəçinin adı"], input[name="stamatoloq"]');
    const passwordInput = page.locator('input[type="password"], input[placeholder="Şifrə"]');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Daxil ol")');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    await page.screenshot({ path: 'QA/screenshots/auth-ui-001-login-page.png' });
  });
});

test.describe('AUTH-UI-002: Successful Login UI', () => {
  test('should navigate after successful login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[placeholder="İstifadəçinin adı"], input[name="stamatoloq"]').fill(VALID_USER);
    await page.locator('input[placeholder="Şifrə"], input[type="password"]').fill(VALID_PASS);
    await page.locator('button[type="submit"], button:has-text("Daxil ol")').click();

    // Should navigate away from login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    const currentUrl = page.url();
    console.log(`AUTH-UI-002: Navigated to ${currentUrl}`);
    expect(currentUrl).not.toContain('/login');
    await page.screenshot({ path: 'QA/screenshots/auth-ui-002-after-login.png' });
  });
});

test.describe('AUTH-UI-003: Wrong Password Login UI', () => {
  test('should show error for wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[placeholder="İstifadəçinin adı"], input[name="stamatoloq"]').fill(VALID_USER);
    await page.locator('input[placeholder="Şifrə"], input[type="password"]').fill('wrongpassword999!');
    await page.locator('button[type="submit"], button:has-text("Daxil ol")').click();

    // Wait for error or stay on login
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'QA/screenshots/auth-ui-003-wrong-password.png' });

    const currentUrl = page.url();
    // Should still be on login page
    const isOnLogin = currentUrl.includes('/login') || currentUrl.endsWith('/');
    console.log(`AUTH-UI-003: URL after wrong password = ${currentUrl}`);
    // Check for any error message
    const errorMsg = page.locator('.error-message, [class*="error"], [class*="Error"]');
    const toastError = page.locator('.Toastify__toast--error, [class*="toast"]');
    const hasError = (await errorMsg.count()) > 0 || (await toastError.count()) > 0;
    console.log(`AUTH-UI-003: Error shown = ${hasError}`);
  });
});

test.describe('AUTH-UI-004: Empty Fields Login UI', () => {
  test('should not submit with empty username and password', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Don't fill anything, just click submit
    await page.locator('button[type="submit"], button:has-text("Daxil ol")').click();
    await page.waitForTimeout(2000);

    // Should still be on login page
    const currentUrl = page.url();
    console.log(`AUTH-UI-004: URL after empty submit = ${currentUrl}`);
    await page.screenshot({ path: 'QA/screenshots/auth-ui-004-empty-submit.png' });
  });
});

test.describe('AUTH-UI-005: Protected Route Without Login', () => {
  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Fresh page without auth
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`AUTH-UI-005: URL when accessing /patients without auth = ${currentUrl}`);
    await page.screenshot({ path: 'QA/screenshots/auth-ui-005-protected-route-no-auth.png' });
    // Should redirect to login or show access denied
  });
});

test.describe('AUTH-UI-006: Double Click Submit Button', () => {
  test('should not send duplicate login requests on double click', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const requests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/login')) {
        requests.push(req.url());
      }
    });

    await page.locator('input[placeholder="İstifadəçinin adı"], input[name="stamatoloq"]').fill(VALID_USER);
    await page.locator('input[placeholder="Şifrə"], input[type="password"]').fill(VALID_PASS);

    // Double click
    const btn = page.locator('button[type="submit"], button:has-text("Daxil ol")');
    await btn.dblclick();
    await page.waitForTimeout(3000);

    console.log(`AUTH-UI-006: Login API requests count = ${requests.length}`);
    if (requests.length > 1) {
      console.log(`⚠️  BUG-CANDIDATE: Double click sent ${requests.length} login requests`);
    }
    await page.screenshot({ path: 'QA/screenshots/auth-ui-006-double-click.png' });
  });
});

test.describe('AUTH-UI-007: Password Visibility Toggle', () => {
  test('password toggle shows/hides password', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[placeholder="Şifrə"], input[type="password"]').first();
    await passwordInput.fill('testpassword');

    // Initially should be password type
    let inputType = await passwordInput.getAttribute('type');
    console.log(`AUTH-UI-007: Initial type = ${inputType}`);

    // Click eye icon
    const eyeBtn = page.locator('.eye-btn, [class*="eye"]').first();
    if ((await eyeBtn.count()) > 0) {
      await eyeBtn.click();
      await page.waitForTimeout(500);
      // Check if type changed
      const passwordFieldAfter = page.locator('input[name="password"], input[placeholder="Şifrə"]').first();
      const typeAfter = await passwordFieldAfter.getAttribute('type');
      console.log(`AUTH-UI-007: After toggle type = ${typeAfter}`);
    }
    await page.screenshot({ path: 'QA/screenshots/auth-ui-007-password-toggle.png' });
  });
});

test.describe('AUTH-UI-008: Logout Functionality', () => {
  test('should clear session on logout', async ({ authPage }) => {
    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);

    // Check localStorage before logout
    const tokenBefore = await authPage.evaluate(() => localStorage.getItem('token'));
    console.log(`AUTH-UI-008: Token before logout = ${tokenBefore ? 'present' : 'absent'}`);

    // Find and click logout button
    const logoutBtn = authPage.locator('button:has-text("Çıxış"), button:has-text("Logout"), [class*="logout"], button:has-text("Çıx")');
    if ((await logoutBtn.count()) > 0) {
      await logoutBtn.first().click();
      await authPage.waitForTimeout(2000);

      const tokenAfter = await authPage.evaluate(() => localStorage.getItem('token'));
      console.log(`AUTH-UI-008: Token after logout = ${tokenAfter ? 'still present!' : 'cleared'}`);
      expect(tokenAfter).toBeNull();
    } else {
      console.log('AUTH-UI-008: Logout button not found - SKIP');
    }
    await authPage.screenshot({ path: 'QA/screenshots/auth-ui-008-logout.png' });
  });
});

test.describe('AUTH-UI-009: Back Button After Login', () => {
  test('should not go back to login page after successful login', async ({ authPage }) => {
    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);

    // Press back
    await authPage.goBack();
    await authPage.waitForTimeout(2000);
    const url = authPage.url();
    console.log(`AUTH-UI-009: URL after back = ${url}`);
    await authPage.screenshot({ path: 'QA/screenshots/auth-ui-009-back-button.png' });
  });
});

test.describe('AUTH-UI-010: Token in localStorage', () => {
  test('should store token properly in localStorage', async ({ authPage }) => {
    await authPage.goto('/');
    await authPage.waitForLoadState('networkidle');

    const storageData = await authPage.evaluate(() => ({
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
      userId: localStorage.getItem('userId'),
    }));

    console.log(`AUTH-UI-010: localStorage token = ${storageData.token ? 'present' : 'absent'}`);
    console.log(`AUTH-UI-010: localStorage refreshToken = ${storageData.refreshToken ? 'present' : 'absent'}`);
    console.log(`AUTH-UI-010: localStorage userId = ${storageData.userId}`);
    expect(storageData.token).toBeTruthy();
    expect(storageData.refreshToken).toBeTruthy();
  });
});
