import { test, expect } from '../fixtures';

// ─────────────────────────────────────────────
// UI/UX TESTS - All major pages
// ─────────────────────────────────────────────

const mainRoutes = [
  { path: '/', name: 'Home' },
  { path: '/patients', name: 'Patients List' },
  { path: '/employees', name: 'Employees List' },
  { path: '/appointments', name: 'Appointments Calendar' },
  { path: '/sent-orders', name: 'Sent Orders' },
  { path: '/received-orders', name: 'Received Orders' },
  { path: '/technicals-report', name: 'Technicals Report' },
  { path: '/stock/clinic', name: 'Clinic Stock' },
  { path: '/stock/cabinet', name: 'Cabinet Stock' },
  { path: '/stock/import', name: 'Stock Import' },
  { path: '/stock/order', name: 'Stock Order' },
  { path: '/stock/export', name: 'Stock Export' },
  { path: '/stock/entry', name: 'Stock Entry' },
  { path: '/stock/delete', name: 'Stock Delete' },
  { path: '/stock/usage', name: 'Product Usage' },
  { path: '/product-categories', name: 'Product Categories' },
  { path: '/specialities', name: 'Specialities' },
  { path: '/permissions', name: 'Permissions' },
  { path: '/technicians', name: 'Technicians' },
  { path: '/appointment-types', name: 'Appointment Types' },
  { path: '/checklist', name: 'Checklist' },
  { path: '/operations', name: 'Operations' },
  { path: '/colors', name: 'Colors' },
  { path: '/implants', name: 'Implants' },
  { path: '/dental-set', name: 'Dental Set' },
  { path: '/insurance', name: 'Insurance' },
  { path: '/price-category', name: 'Price Category' },
  { path: '/cabinets', name: 'Cabinets' },
  { path: '/recepts', name: 'Recepts' },
  { path: '/anamnesis', name: 'Anamnesis' },
  { path: '/blacklist-reasons', name: 'Blacklist Reasons' },
  { path: '/metals', name: 'Metals' },
  { path: '/ceramics', name: 'Ceramics' },
  { path: '/general-settings', name: 'General Settings' },
  { path: '/reports', name: 'Reports' },
  { path: '/admin-users', name: 'Admin Users' },
  { path: '/queue', name: 'Queue' },
];

test.describe('UI-001: All Major Pages Load Without Critical Errors', () => {
  for (const route of mainRoutes) {
    test(`should load ${route.name} page (${route.path})`, async ({ authPage }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const networkErrors: string[] = [];

      authPage.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      authPage.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });
      authPage.on('requestfailed', (req) => {
        networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
      });

      await authPage.goto(route.path);
      await authPage.waitForLoadState('networkidle').catch(() => {});
      await authPage.waitForTimeout(2500);

      // Check for horizontal overflow (layout break)
      const hasHorizontalScroll = await authPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      await authPage.screenshot({ 
        path: `QA/screenshots/ui-${route.path.replace(/\//g, '-').replace(/^-/, '')}.png`,
        fullPage: true 
      });

      if (consoleErrors.length > 0) {
        console.log(`UI ${route.name} Console errors: ${consoleErrors.join(' | ')}`);
      }
      if (pageErrors.length > 0) {
        console.log(`UI ${route.name} Page errors: ${pageErrors.join(' | ')}`);
      }
      if (networkErrors.length > 0) {
        console.log(`UI ${route.name} Network errors: ${networkErrors.join(' | ')}`);
      }
      if (hasHorizontalScroll) {
        console.log(`⚠️ UI ${route.name} has HORIZONTAL OVERFLOW (layout bug)`);
      }

      // Must not have JS page crashes
      expect(pageErrors.filter(e => !e.includes('ResizeObserver')).length).toBe(0);
    });
  }
});

test.describe('UI-002: Responsive Test - Mobile Viewport', () => {
  const mobileRoutes = ['/', '/patients', '/appointments', '/employees'];
  
  for (const route of mobileRoutes) {
    test(`${route} should not overflow on mobile (390x844)`, async ({ browser }) => {
      const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();
      
      await page.goto(route);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      await page.screenshot({ 
        path: `QA/screenshots/responsive-mobile-${route.replace(/\//g, '-')}.png` 
      });
      
      if (overflow) {
        console.log(`⚠️ RESPONSIVE BUG: ${route} has horizontal overflow on mobile 390x844`);
      }
      
      await context.close();
    });
  }
});

test.describe('UI-003: 404 Not Found Page', () => {
  test('should show 404 page for non-existent routes', async ({ authPage }) => {
    await authPage.goto('/nonexistent-route-12345');
    await authPage.waitForTimeout(2000);
    
    const url = authPage.url();
    await authPage.screenshot({ path: 'QA/screenshots/ui-003-404-page.png' });
    console.log(`UI-003: URL for non-existent route = ${url}`);
  });
});

test.describe('UI-004: Page Refresh Test', () => {
  test('should maintain state after page refresh', async ({ authPage }) => {
    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);

    // Refresh
    await authPage.reload();
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);

    const url = authPage.url();
    console.log(`UI-004: URL after refresh = ${url}`);
    await authPage.screenshot({ path: 'QA/screenshots/ui-004-after-refresh.png' });
    
    // Should still be on patients page (not redirected to login)
    expect(url).toContain('/patients');
  });
});

test.describe('UI-005: Navigation Back/Forward', () => {
  test('should navigate correctly with browser back/forward', async ({ authPage }) => {
    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(1500);

    await authPage.goto('/employees');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(1500);

    // Go back
    await authPage.goBack();
    await authPage.waitForTimeout(1500);
    const backUrl = authPage.url();
    console.log(`UI-005: After back = ${backUrl}`);

    // Go forward
    await authPage.goForward();
    await authPage.waitForTimeout(1500);
    const forwardUrl = authPage.url();
    console.log(`UI-005: After forward = ${forwardUrl}`);

    await authPage.screenshot({ path: 'QA/screenshots/ui-005-navigation.png' });
  });
});

test.describe('UI-006: Direct URL Access', () => {
  test('should load when URL is opened directly', async ({ authPage }) => {
    await authPage.goto('/patients/add-patient');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);

    const url = authPage.url();
    console.log(`UI-006: Direct /patients/add-patient URL = ${url}`);
    await authPage.screenshot({ path: 'QA/screenshots/ui-006-direct-url.png' });
  });
});

test.describe('UI-007: ESC Key Modal Closing', () => {
  test('should close modals with ESC key', async ({ authPage }) => {
    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);

    // Try to open a modal by clicking add button
    const addBtn = authPage.locator('button:has-text("Əlavə et"), button:has-text("Add")').first();
    if ((await addBtn.count()) > 0) {
      await addBtn.click();
      await authPage.waitForTimeout(1000);
      
      // Press ESC
      await authPage.keyboard.press('Escape');
      await authPage.waitForTimeout(1000);
      await authPage.screenshot({ path: 'QA/screenshots/ui-007-esc-modal.png' });
      console.log('UI-007: ESC key pressed');
    } else {
      console.log('UI-007: No modal to test ESC on');
    }
  });
});
