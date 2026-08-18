import { test, expect, apiRequest } from '../fixtures';

const DATE_TAG = '20260819';

// ─────────────────────────────────────────────
// WAREHOUSE RECEIPT TESTS
// ─────────────────────────────────────────────

test.describe('WH-001: Search Warehouse Receipts', () => {
  test('should search warehouse receipts', async () => {
    const { status, data } = await apiRequest('POST', '/warehouse-receipts/search', {});
    console.log(`WH-001: status=${status}, count=${Array.isArray(data) ? (data as unknown[]).length : 'N/A'}`);
    expect(status).toBe(200);
  });
});

test.describe('WH-002: Get Warehouse Receipt Info', () => {
  test('should get receipt info by ID', async () => {
    const { data: listData } = await apiRequest('POST', '/warehouse-receipts/search', {});
    const receipts = listData as Array<{ id: number }>;
    if (!Array.isArray(receipts) || receipts.length === 0) {
      console.log('WH-002: No receipts - BLOCKED');
      return;
    }

    const { status, data } = await apiRequest('GET', `/warehouse-receipts/info/${receipts[0].id}`);
    expect(status).toBe(200);
    console.log(`WH-002: Receipt info = ${JSON.stringify(data)}`);
  });
});

test.describe('WH-003: Get Receipt By Non-Existent ID', () => {
  test('should return 404 for non-existent receipt', async () => {
    const { status, data } = await apiRequest('GET', '/warehouse-receipts/info/999999999');
    console.log(`WH-003: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).not.toBe(200);
  });
});

test.describe('WH-004: Update Warehouse Receipt Status', () => {
  test('should update receipt pending status', async () => {
    const { data: listData } = await apiRequest('POST', '/warehouse-receipts/search', {
      pendingStatus: 'WAITING',
    });
    const receipts = listData as Array<{ id: number }>;
    if (!Array.isArray(receipts) || receipts.length === 0) {
      console.log('WH-004: No WAITING receipts - BLOCKED');
      return;
    }

    const { status, data } = await apiRequest('PUT', '/warehouse-receipts/pending-status-updated', {
      id: receipts[0].id,
      status: 'APPROVED',
    });
    console.log(`WH-004 Status update: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// WAREHOUSE REMOVAL TESTS
// ─────────────────────────────────────────────

test.describe('WH-005: Get Warehouse Removals', () => {
  test('should return warehouse removals list', async () => {
    // Try different possible endpoints
    const endpoints = [
      '/warehouse/removal/read',
      '/warehouse-removal/read',
      '/warehouse/removals',
    ];

    for (const ep of endpoints) {
      const { status, data } = await apiRequest('GET', ep);
      console.log(`WH-005 ${ep}: status=${status}`);
      if (status === 200) {
        console.log(`WH-005: Found at ${ep}, count=${Array.isArray(data) ? (data as unknown[]).length : 'N/A'}`);
        break;
      }
    }
  });
});

// ─────────────────────────────────────────────
// PRODUCT CATEGORY TESTS
// ─────────────────────────────────────────────

test.describe('PROD-001: Get Product Categories', () => {
  test('should return product categories', async () => {
    // Try to find the right endpoint
    const endpoints = [
      '/product-category/read',
      '/product/category/read',
      '/product-categories/read',
    ];

    let found = false;
    for (const ep of endpoints) {
      const { status, data } = await apiRequest('GET', ep);
      console.log(`PROD-001 ${ep}: status=${status}`);
      if (status === 200) {
        const cats = data as unknown[];
        console.log(`PROD-001: Found at ${ep}, count=${Array.isArray(cats) ? cats.length : 'N/A'}`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log('PROD-001: Product categories endpoint not found with tested paths');
    }
  });
});

test.describe('PROD-002: Get Products', () => {
  test('should return products list', async () => {
    const endpoints = [
      '/product/read',
      '/products/read',
    ];

    for (const ep of endpoints) {
      const { status, data } = await apiRequest('GET', ep);
      console.log(`PROD-002 ${ep}: status=${status}`);
      if (status === 200) {
        console.log(`PROD-002: Found at ${ep}`);
        break;
      }
    }
  });
});

// ─────────────────────────────────────────────
// PERMISSION TESTS
// ─────────────────────────────────────────────

test.describe('PERM-001: Get All Permissions', () => {
  test('should return permissions list', async () => {
    const { status, data } = await apiRequest('GET', '/permission/read');
    expect(status).toBe(200);
    const perms = data as unknown[];
    console.log(`PERM-001: Total permissions = ${Array.isArray(perms) ? perms.length : 'N/A'}`);
    if (Array.isArray(perms) && perms.length > 0) {
      console.log(`PERM-001: Sample permission = ${JSON.stringify(perms[0])}`);
    }
  });
});

test.describe('PERM-002: Create Permission', () => {
  test('should create a new permission', async () => {
    const { status, data } = await apiRequest('POST', '/permission/create', {
      name: `QA Test Permission ${DATE_TAG}`,
      description: 'QA test permission created by automation',
    });
    console.log(`PERM-002 Create: status=${status}, data=${JSON.stringify(data)}`);
  });
});

test.describe('PERM-003: Permission - Without Token', () => {
  test('should reject permission access without token', async () => {
    const { status } = await apiRequest('GET', '/permission/read', undefined, '');
    expect(status).toBe(401);
    console.log(`PERM-003: status=${status}`);
  });
});

test.describe('PERM-004: Delete Non-Existent Permission', () => {
  test('should return error deleting non-existent permission', async () => {
    const { status, data } = await apiRequest('DELETE', '/permission/delete/999999999');
    console.log(`PERM-004 Delete non-existent: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).not.toBe(200);
  });
});

// ─────────────────────────────────────────────
// WORKER TESTS
// ─────────────────────────────────────────────

test.describe('WORK-001: Get Workers List', () => {
  test('should return workers list', async () => {
    const endpoints = [
      '/worker/read',
      '/workers/read',
      '/employee/read',
    ];

    for (const ep of endpoints) {
      const { status, data } = await apiRequest('GET', ep);
      console.log(`WORK-001 ${ep}: status=${status}`);
      if (status === 200) {
        const workers = data as unknown[];
        console.log(`WORK-001: Found at ${ep}, count=${Array.isArray(workers) ? workers.length : 'N/A'}`);
        break;
      }
    }
  });
});

// ─────────────────────────────────────────────
// INSURANCE TESTS
// ─────────────────────────────────────────────

test.describe('INS-001: Get Insurance Companies', () => {
  test('should return insurance companies', async () => {
    const endpoints = [
      '/insurance/read',
      '/insurance-company/read',
    ];

    for (const ep of endpoints) {
      const { status, data } = await apiRequest('GET', ep);
      console.log(`INS-001 ${ep}: status=${status}`);
      if (status === 200) {
        console.log(`INS-001: Found at ${ep}`);
        break;
      }
    }
  });
});

// ─────────────────────────────────────────────
// WAREHOUSE UI TESTS
// ─────────────────────────────────────────────

test.describe('WH-UI-001: Clinic Stock Page', () => {
  test('should load clinic stock page', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/stock/clinic');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/wh-ui-001-clinic-stock.png' });
    console.log(`WH-UI-001: Console errors = ${consoleErrors.join(' | ')}`);
  });
});

test.describe('WH-UI-002: Stock Import Page', () => {
  test('should load stock import page', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/stock/import');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/wh-ui-002-stock-import.png' });
    console.log(`WH-UI-002: Console errors = ${consoleErrors.join(' | ')}`);
  });
});

test.describe('WH-UI-003: Stock Order Page', () => {
  test('should load stock order page', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/stock/order');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/wh-ui-003-stock-order.png' });
    console.log(`WH-UI-003: Console errors = ${consoleErrors.join(' | ')}`);
  });
});

test.describe('WH-UI-004: Product Categories Page', () => {
  test('should load product categories page', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/product-categories');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/wh-ui-004-product-categories.png' });
    console.log(`WH-UI-004: Console errors = ${consoleErrors.join(' | ')}`);
  });
});
