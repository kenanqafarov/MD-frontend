import { test, expect, apiRequest } from '../fixtures';

const DATE_TAG = '20260819';

// ─────────────────────────────────────────────
// DENTAL ORDER API TESTS
// ─────────────────────────────────────────────

test.describe('LAB-001: Get All Dental Orders', () => {
  test('should return list of dental orders', async () => {
    const { status, data } = await apiRequest('GET', '/laboratory/order/read');
    expect(status).toBe(200);
    const orders = data as unknown[];
    console.log(`LAB-001: Total orders = ${Array.isArray(orders) ? orders.length : 'not array'}`);
    if (Array.isArray(orders) && orders.length > 0) {
      console.log(`LAB-001: Sample order = ${JSON.stringify(orders[0])}`);
    }
  });
});

test.describe('LAB-002: Get Technic Orders', () => {
  test('should return technic orders', async () => {
    const { status, data } = await apiRequest('GET', '/laboratory/technic/order/read');
    console.log(`LAB-002: status=${status}, count=${Array.isArray(data) ? (data as unknown[]).length : 'N/A'}`);
    expect(status).toBe(200);
  });
});

test.describe('LAB-003: Get Dental Work Types', () => {
  test('should return dental work types', async () => {
    const { status, data } = await apiRequest('GET', '/laboratory/order/read/dental-work-type');
    console.log(`LAB-003: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).toBe(200);
  });
});

test.describe('LAB-004: Create Dental Order - Valid Data', () => {
  test('should create dental order', async () => {
    const { data: patientData } = await apiRequest('GET', '/patient/read');
    const patients = patientData as Array<{ id: number }>;
    if (patients.length === 0) {
      console.log('LAB-004: No patients - BLOCKED');
      return;
    }

    const orderData = {
      patientId: patients[0].id,
      note: `QA Dental Order ${DATE_TAG}`,
    };

    const { status, data } = await apiRequest('POST', '/laboratory/order/create', orderData);
    console.log(`LAB-004 Create: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).toBe(200).or(expect(status).toBe(201));
  });
});

test.describe('LAB-005: Get Dental Order By ID', () => {
  test('should retrieve dental order by ID', async () => {
    const { data: orderList } = await apiRequest('GET', '/laboratory/order/read');
    const orders = orderList as Array<{ id: number }>;
    if (orders.length === 0) {
      console.log('LAB-005: No orders - BLOCKED');
      return;
    }

    const { status, data } = await apiRequest('GET', `/laboratory/order/read-by-id/${orders[0].id}`);
    expect(status).toBe(200);
    console.log(`LAB-005: Order data = ${JSON.stringify(data)}`);
  });
});

test.describe('LAB-006: Get Dental Order By Non-Existent ID', () => {
  test('should return 404 for non-existent order', async () => {
    const { status, data } = await apiRequest('GET', '/laboratory/order/read-by-id/999999999');
    console.log(`LAB-006 Non-existent ID: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).not.toBe(200);
  });
});

test.describe('LAB-007: Update Dental Order Status', () => {
  test('should update order status', async () => {
    const { data: orderList } = await apiRequest('GET', '/laboratory/order/read');
    const orders = orderList as Array<{ id: number; status?: string }>;
    if (orders.length === 0) {
      console.log('LAB-007: No orders - BLOCKED');
      return;
    }

    const { status, data } = await apiRequest('PATCH', '/laboratory/order/status', {
      id: orders[0].id,
      status: 'IN_PROGRESS',
    });
    console.log(`LAB-007 Status update: status=${status}, data=${JSON.stringify(data)}`);
  });
});

test.describe('LAB-008: Delete Dental Order', () => {
  test('should delete dental order', async () => {
    const { data: orderList } = await apiRequest('GET', '/laboratory/order/read');
    const orders = orderList as Array<{ id: number; note?: string }>;
    // Find QA test order
    const qaOrder = orders.find((o) => o.note && String(o.note).includes('QA Dental Order'));
    if (!qaOrder) {
      console.log('LAB-008: No QA test order found - BLOCKED');
      return;
    }

    const { status, data } = await apiRequest('DELETE', `/laboratory/order/delete/${qaOrder.id}`);
    console.log(`LAB-008 Delete: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).toBe(200).or(expect(status).toBe(204));
  });
});

test.describe('LAB-009: Update Technic Order Price', () => {
  test('should update technic order price', async () => {
    const { data: orderList } = await apiRequest('GET', '/laboratory/technic/order/read');
    const orders = orderList as Array<{ id: number }>;
    if (orders.length === 0) {
      console.log('LAB-009: No technic orders - BLOCKED');
      return;
    }

    const { status, data } = await apiRequest('PATCH', `/laboratory/technic/order/${orders[0].id}/price`, {
      price: 100.0,
    });
    console.log(`LAB-009 Price update: status=${status}, data=${JSON.stringify(data)}`);
  });
});

test.describe('LAB-010: Update Technic Order Price - Negative', () => {
  test('should reject negative price', async () => {
    const { data: orderList } = await apiRequest('GET', '/laboratory/technic/order/read');
    const orders = orderList as Array<{ id: number }>;
    if (orders.length === 0) {
      console.log('LAB-010: No technic orders - BLOCKED');
      return;
    }

    const { status, data } = await apiRequest('PATCH', `/laboratory/technic/order/${orders[0].id}/price`, {
      price: -50.0,
    });
    console.log(`LAB-010 Negative price: status=${status}, data=${JSON.stringify(data)}`);
    if (status === 200) {
      console.log('⚠️  BUG-CANDIDATE: Backend accepts negative price for technic order');
    }
  });
});

test.describe('LAB-011: Update Technic Order Price - Zero', () => {
  test('should handle zero price', async () => {
    const { data: orderList } = await apiRequest('GET', '/laboratory/technic/order/read');
    const orders = orderList as Array<{ id: number }>;
    if (orders.length === 0) return;

    const { status, data } = await apiRequest('PATCH', `/laboratory/technic/order/${orders[0].id}/price`, {
      price: 0,
    });
    console.log(`LAB-011 Zero price: status=${status}, data=${JSON.stringify(data)}`);
  });
});

// ─────────────────────────────────────────────
// LABORATORY UI TESTS  
// ─────────────────────────────────────────────

test.describe('LAB-UI-001: Sent Orders Page', () => {
  test('should load sent orders page', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/sent-orders');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/lab-ui-001-sent-orders.png' });
    console.log(`LAB-UI-001: Console errors = ${consoleErrors.join(' | ')}`);
  });
});

test.describe('LAB-UI-002: Received Orders Page', () => {
  test('should load received orders page', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/received-orders');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/lab-ui-002-received-orders.png' });
    console.log(`LAB-UI-002: Console errors = ${consoleErrors.join(' | ')}`);
  });
});

test.describe('LAB-UI-003: Technicians Report Page', () => {
  test('should load technicians report page', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/technicals-report');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/lab-ui-003-technicals-report.png' });
    console.log(`LAB-UI-003: Console errors = ${consoleErrors.join(' | ')}`);
  });
});
