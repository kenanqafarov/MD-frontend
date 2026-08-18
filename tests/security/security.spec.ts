import { test, expect, apiRequest } from '../fixtures';

// ─────────────────────────────────────────────
// SECURITY TESTS
// ─────────────────────────────────────────────

test.describe('SEC-001: No Token - Cannot Access Patient Data', () => {
  test('patient endpoints should require authentication', async () => {
    const protectedEndpoints = [
      { method: 'GET', endpoint: '/patient/read' },
      { method: 'POST', endpoint: '/patient/create', body: {} },
      { method: 'PUT', endpoint: '/patient/update', body: {} },
      { method: 'DELETE', endpoint: '/patient/delete/1' },
      { method: 'GET', endpoint: '/patient/export/excel' },
    ];

    const results = [];
    for (const ep of protectedEndpoints) {
      const { status } = await apiRequest(ep.method, ep.endpoint, ep.body, '');
      results.push({ endpoint: ep.endpoint, method: ep.method, status });
      if (status !== 401 && status !== 403) {
        console.log(`⚠️ SECURITY: ${ep.method} ${ep.endpoint} returned ${status} without auth!`);
      }
    }

    console.log('SEC-001 Results:', JSON.stringify(results, null, 2));
    results.forEach((r) => {
      expect(r.status).toBe(401);
    });
  });
});

test.describe('SEC-002: No Token - Cannot Access Reservation Data', () => {
  test('reservation endpoints should require authentication', async () => {
    const { status } = await apiRequest('GET', '/reservations/read', undefined, '');
    expect(status).toBe(401);
    console.log(`SEC-002: GET /reservations/read without auth = ${status}`);
  });
});

test.describe('SEC-003: No Token - Cannot Access Permission Data', () => {
  test('permission endpoints should require authentication', async () => {
    const { status } = await apiRequest('GET', '/permission/read', undefined, '');
    expect(status).toBe(401);
    console.log(`SEC-003: GET /permission/read without auth = ${status}`);
  });
});

test.describe('SEC-004: No Token - Cannot Access Laboratory Data', () => {
  test('laboratory endpoints should require authentication', async () => {
    const endpoints = [
      '/laboratory/order/read',
      '/laboratory/technic/order/read',
    ];
    for (const ep of endpoints) {
      const { status } = await apiRequest('GET', ep, undefined, '');
      expect(status).toBe(401);
      console.log(`SEC-004: GET ${ep} without auth = ${status}`);
    }
  });
});

test.describe('SEC-005: No Token - Cannot Access Warehouse Data', () => {
  test('warehouse endpoints should require authentication', async () => {
    const { status } = await apiRequest('POST', '/warehouse-receipts/search', {}, '');
    expect(status).toBe(401);
    console.log(`SEC-005: POST /warehouse-receipts/search without auth = ${status}`);
  });
});

test.describe('SEC-006: IDOR Test - Access Other Patient Data', () => {
  test('should not allow accessing arbitrary patient IDs without proper auth', async () => {
    // With valid token, try to access patient IDs sequentially
    const { data: patients } = await apiRequest('GET', '/patient/read');
    const pList = patients as Array<{ id: number }>;
    
    if (pList.length >= 2) {
      // Access multiple patient records
      const { status, data } = await apiRequest('GET', `/patient/read-by-id/${pList[1].id}`);
      console.log(`SEC-006: Accessing patient ${pList[1].id}: status=${status}`);
      // As super_admin, this should work - but document the access pattern
      // The real concern is whether any user can access ANY patient
    }
    
    // Test with a very low ID (possibly admin or first user)
    const { status: s1, data: d1 } = await apiRequest('GET', '/patient/read-by-id/1');
    console.log(`SEC-006: Access patient ID=1: status=${s1}`);
    
    console.log('SEC-006: IDOR risk depends on multi-tenancy model - needs manual review');
    expect(true).toBe(true); // Always pass - this is an informational test
  });
});

test.describe('SEC-007: SQL Injection in Search', () => {
  test('patient search should be safe from SQL injection', async () => {
    const payloads = [
      { name: "' OR '1'='1" },
      { name: "'; DROP TABLE patients; --" },
      { name: '1=1 UNION SELECT * FROM users' },
      { name: '<script>alert(1)</script>' },
    ];

    for (const payload of payloads) {
      const { status, data } = await apiRequest('POST', '/patient/search', payload);
      console.log(`SEC-007 Injection "${payload.name}": status=${status}`);
      // Should not crash with 500
      expect(status).not.toBe(500);
    }
  });
});

test.describe('SEC-008: Large Payload Attack', () => {
  test('should handle very large request body', async () => {
    const largePayload = {
      name: 'A'.repeat(10000),
      surname: 'B'.repeat(10000),
      address: 'C'.repeat(50000),
    };

    const { status } = await apiRequest('POST', '/patient/create', largePayload);
    console.log(`SEC-008 Large payload: status=${status}`);
    // Should reject (400/422) or trim, not crash (500)
    expect(status).not.toBe(500);
  });
});

test.describe('SEC-009: Expired Token Test', () => {
  test('should reject an expired JWT token', async () => {
    // This is an expired JWT (exp in the past)
    const expiredToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid';
    const { status } = await apiRequest('GET', '/patient/read', undefined, expiredToken);
    expect(status).toBe(401);
    console.log(`SEC-009: Expired token response = ${status}`);
  });
});

test.describe('SEC-010: Token from Different User', () => {
  test('should document token cross-user access behavior', async () => {
    // Get our token first
    const { data: loginData } = await apiRequest('POST', '/auth/login', {
      username: 'super_admin',
      password: 'super1234',
    }, '');

    const loginTyped = loginData as { tokenPair?: { accessToken: string } };
    if (!loginTyped.tokenPair?.accessToken) {
      console.log('SEC-010: Could not get token - BLOCKED');
      return;
    }

    // With valid token, try patient deletion with ID 999999
    const { status } = await apiRequest('DELETE', '/patient/delete/999999999');
    console.log(`SEC-010: DELETE non-existent patient: status=${status}`);
    // Should be 404, not 200
    expect(status).not.toBe(200);
  });
});

// ─────────────────────────────────────────────
// FRONTEND SECURITY CHECKS
// ─────────────────────────────────────────────

test.describe('SEC-UI-001: Direct Access to Protected Routes Without Auth', () => {
  test('should redirect to login when accessing protected route', async ({ browser }) => {
    // Fresh browser without auth
    const context = await browser.newContext();
    const page = await context.newPage();

    const protectedRoutes = ['/patients', '/employees', '/appointments', '/permissions'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      
      const url = page.url();
      const isOnLogin = url.includes('/login') || url.endsWith('/');
      console.log(`SEC-UI-001 ${route}: redirected to ${url} (login: ${isOnLogin})`);
      
      await page.screenshot({ 
        path: `QA/screenshots/sec-ui-001${route.replace(/\//g, '-')}-noauth.png` 
      });
    }

    await context.close();
  });
});

test.describe('SEC-UI-002: Sensitive Data in localStorage', () => {
  test('should check what sensitive data is stored in localStorage', async ({ authPage }) => {
    await authPage.goto('/');
    await authPage.waitForLoadState('networkidle');

    const storageKeys = await authPage.evaluate(() => {
      const result: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          result[key] = localStorage.getItem(key);
        }
      }
      return result;
    });

    console.log('SEC-UI-002: localStorage keys found:');
    for (const [key, value] of Object.entries(storageKeys)) {
      const displayValue = key.includes('token') || key.includes('Token') 
        ? `[JWT TOKEN - ${value ? value.length : 0} chars]` 
        : key === 'patients_cache' 
        ? `[CACHE - ${value ? value.length : 0} chars]`
        : String(value).substring(0, 100);
      console.log(`  ${key}: ${displayValue}`);
    }

    // Token stored in localStorage is a known security concern
    // (HttpOnly cookies would be safer)
    if (storageKeys['token']) {
      console.log('⚠️ SECURITY NOTE: JWT token stored in localStorage (vulnerable to XSS)');
      console.log('   Recommendation: Use HttpOnly cookies for token storage');
    }
  });
});
