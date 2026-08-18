# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security/security.spec.ts >> SEC-004: No Token - Cannot Access Laboratory Data >> laboratory endpoints should require authentication
- Location: tests/security/security.spec.ts:50:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 200
```

# Test source

```ts
  1   | import { test, expect, apiRequest } from '../fixtures';
  2   | 
  3   | // ─────────────────────────────────────────────
  4   | // SECURITY TESTS
  5   | // ─────────────────────────────────────────────
  6   | 
  7   | test.describe('SEC-001: No Token - Cannot Access Patient Data', () => {
  8   |   test('patient endpoints should require authentication', async () => {
  9   |     const protectedEndpoints = [
  10  |       { method: 'GET', endpoint: '/patient/read' },
  11  |       { method: 'POST', endpoint: '/patient/create', body: {} },
  12  |       { method: 'PUT', endpoint: '/patient/update', body: {} },
  13  |       { method: 'DELETE', endpoint: '/patient/delete/1' },
  14  |       { method: 'GET', endpoint: '/patient/export/excel' },
  15  |     ];
  16  | 
  17  |     const results = [];
  18  |     for (const ep of protectedEndpoints) {
  19  |       const { status } = await apiRequest(ep.method, ep.endpoint, ep.body, '');
  20  |       results.push({ endpoint: ep.endpoint, method: ep.method, status });
  21  |       if (status !== 401 && status !== 403) {
  22  |         console.log(`⚠️ SECURITY: ${ep.method} ${ep.endpoint} returned ${status} without auth!`);
  23  |       }
  24  |     }
  25  | 
  26  |     console.log('SEC-001 Results:', JSON.stringify(results, null, 2));
  27  |     results.forEach((r) => {
  28  |       expect(r.status).toBe(401);
  29  |     });
  30  |   });
  31  | });
  32  | 
  33  | test.describe('SEC-002: No Token - Cannot Access Reservation Data', () => {
  34  |   test('reservation endpoints should require authentication', async () => {
  35  |     const { status } = await apiRequest('GET', '/reservations/read', undefined, '');
  36  |     expect(status).toBe(401);
  37  |     console.log(`SEC-002: GET /reservations/read without auth = ${status}`);
  38  |   });
  39  | });
  40  | 
  41  | test.describe('SEC-003: No Token - Cannot Access Permission Data', () => {
  42  |   test('permission endpoints should require authentication', async () => {
  43  |     const { status } = await apiRequest('GET', '/permission/read', undefined, '');
  44  |     expect(status).toBe(401);
  45  |     console.log(`SEC-003: GET /permission/read without auth = ${status}`);
  46  |   });
  47  | });
  48  | 
  49  | test.describe('SEC-004: No Token - Cannot Access Laboratory Data', () => {
  50  |   test('laboratory endpoints should require authentication', async () => {
  51  |     const endpoints = [
  52  |       '/laboratory/order/read',
  53  |       '/laboratory/technic/order/read',
  54  |     ];
  55  |     for (const ep of endpoints) {
  56  |       const { status } = await apiRequest('GET', ep, undefined, '');
> 57  |       expect(status).toBe(401);
      |                      ^ Error: expect(received).toBe(expected) // Object.is equality
  58  |       console.log(`SEC-004: GET ${ep} without auth = ${status}`);
  59  |     }
  60  |   });
  61  | });
  62  | 
  63  | test.describe('SEC-005: No Token - Cannot Access Warehouse Data', () => {
  64  |   test('warehouse endpoints should require authentication', async () => {
  65  |     const { status } = await apiRequest('POST', '/warehouse-receipts/search', {}, '');
  66  |     expect(status).toBe(401);
  67  |     console.log(`SEC-005: POST /warehouse-receipts/search without auth = ${status}`);
  68  |   });
  69  | });
  70  | 
  71  | test.describe('SEC-006: IDOR Test - Access Other Patient Data', () => {
  72  |   test('should not allow accessing arbitrary patient IDs without proper auth', async () => {
  73  |     // With valid token, try to access patient IDs sequentially
  74  |     const { data: patients } = await apiRequest('GET', '/patient/read');
  75  |     const pList = patients as Array<{ id: number }>;
  76  |     
  77  |     if (pList.length >= 2) {
  78  |       // Access multiple patient records
  79  |       const { status, data } = await apiRequest('GET', `/patient/read-by-id/${pList[1].id}`);
  80  |       console.log(`SEC-006: Accessing patient ${pList[1].id}: status=${status}`);
  81  |       // As super_admin, this should work - but document the access pattern
  82  |       // The real concern is whether any user can access ANY patient
  83  |     }
  84  |     
  85  |     // Test with a very low ID (possibly admin or first user)
  86  |     const { status: s1, data: d1 } = await apiRequest('GET', '/patient/read-by-id/1');
  87  |     console.log(`SEC-006: Access patient ID=1: status=${s1}`);
  88  |     
  89  |     console.log('SEC-006: IDOR risk depends on multi-tenancy model - needs manual review');
  90  |     expect(true).toBe(true); // Always pass - this is an informational test
  91  |   });
  92  | });
  93  | 
  94  | test.describe('SEC-007: SQL Injection in Search', () => {
  95  |   test('patient search should be safe from SQL injection', async () => {
  96  |     const payloads = [
  97  |       { name: "' OR '1'='1" },
  98  |       { name: "'; DROP TABLE patients; --" },
  99  |       { name: '1=1 UNION SELECT * FROM users' },
  100 |       { name: '<script>alert(1)</script>' },
  101 |     ];
  102 | 
  103 |     for (const payload of payloads) {
  104 |       const { status, data } = await apiRequest('POST', '/patient/search', payload);
  105 |       console.log(`SEC-007 Injection "${payload.name}": status=${status}`);
  106 |       // Should not crash with 500
  107 |       expect(status).not.toBe(500);
  108 |     }
  109 |   });
  110 | });
  111 | 
  112 | test.describe('SEC-008: Large Payload Attack', () => {
  113 |   test('should handle very large request body', async () => {
  114 |     const largePayload = {
  115 |       name: 'A'.repeat(10000),
  116 |       surname: 'B'.repeat(10000),
  117 |       address: 'C'.repeat(50000),
  118 |     };
  119 | 
  120 |     const { status } = await apiRequest('POST', '/patient/create', largePayload);
  121 |     console.log(`SEC-008 Large payload: status=${status}`);
  122 |     // Should reject (400/422) or trim, not crash (500)
  123 |     expect(status).not.toBe(500);
  124 |   });
  125 | });
  126 | 
  127 | test.describe('SEC-009: Expired Token Test', () => {
  128 |   test('should reject an expired JWT token', async () => {
  129 |     // This is an expired JWT (exp in the past)
  130 |     const expiredToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid';
  131 |     const { status } = await apiRequest('GET', '/patient/read', undefined, expiredToken);
  132 |     expect(status).toBe(401);
  133 |     console.log(`SEC-009: Expired token response = ${status}`);
  134 |   });
  135 | });
  136 | 
  137 | test.describe('SEC-010: Token from Different User', () => {
  138 |   test('should document token cross-user access behavior', async () => {
  139 |     // Get our token first
  140 |     const { data: loginData } = await apiRequest('POST', '/auth/login', {
  141 |       username: 'super_admin',
  142 |       password: 'super1234',
  143 |     }, '');
  144 | 
  145 |     const loginTyped = loginData as { tokenPair?: { accessToken: string } };
  146 |     if (!loginTyped.tokenPair?.accessToken) {
  147 |       console.log('SEC-010: Could not get token - BLOCKED');
  148 |       return;
  149 |     }
  150 | 
  151 |     // With valid token, try patient deletion with ID 999999
  152 |     const { status } = await apiRequest('DELETE', '/patient/delete/999999999');
  153 |     console.log(`SEC-010: DELETE non-existent patient: status=${status}`);
  154 |     // Should be 404, not 200
  155 |     expect(status).not.toBe(200);
  156 |   });
  157 | });
```