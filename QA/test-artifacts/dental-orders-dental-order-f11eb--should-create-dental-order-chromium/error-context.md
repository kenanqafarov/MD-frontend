# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dental-orders/dental-order.spec.ts >> LAB-004: Create Dental Order - Valid Data >> should create dental order
- Location: tests/dental-orders/dental-order.spec.ts:38:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Test source

```ts
  1   | import { test, expect, apiRequest } from '../fixtures';
  2   | 
  3   | const DATE_TAG = '20260819';
  4   | 
  5   | // ─────────────────────────────────────────────
  6   | // DENTAL ORDER API TESTS
  7   | // ─────────────────────────────────────────────
  8   | 
  9   | test.describe('LAB-001: Get All Dental Orders', () => {
  10  |   test('should return list of dental orders', async () => {
  11  |     const { status, data } = await apiRequest('GET', '/laboratory/order/read');
  12  |     expect(status).toBe(200);
  13  |     const orders = data as unknown[];
  14  |     console.log(`LAB-001: Total orders = ${Array.isArray(orders) ? orders.length : 'not array'}`);
  15  |     if (Array.isArray(orders) && orders.length > 0) {
  16  |       console.log(`LAB-001: Sample order = ${JSON.stringify(orders[0])}`);
  17  |     }
  18  |   });
  19  | });
  20  | 
  21  | test.describe('LAB-002: Get Technic Orders', () => {
  22  |   test('should return technic orders', async () => {
  23  |     const { status, data } = await apiRequest('GET', '/laboratory/technic/order/read');
  24  |     console.log(`LAB-002: status=${status}, count=${Array.isArray(data) ? (data as unknown[]).length : 'N/A'}`);
  25  |     expect(status).toBe(200);
  26  |   });
  27  | });
  28  | 
  29  | test.describe('LAB-003: Get Dental Work Types', () => {
  30  |   test('should return dental work types', async () => {
  31  |     const { status, data } = await apiRequest('GET', '/laboratory/order/read/dental-work-type');
  32  |     console.log(`LAB-003: status=${status}, data=${JSON.stringify(data)}`);
  33  |     expect(status).toBe(200);
  34  |   });
  35  | });
  36  | 
  37  | test.describe('LAB-004: Create Dental Order - Valid Data', () => {
  38  |   test('should create dental order', async () => {
  39  |     const { data: patientData } = await apiRequest('GET', '/patient/read');
  40  |     const patients = patientData as Array<{ id: number }>;
  41  |     if (patients.length === 0) {
  42  |       console.log('LAB-004: No patients - BLOCKED');
  43  |       return;
  44  |     }
  45  | 
  46  |     const orderData = {
  47  |       patientId: patients[0].id,
  48  |       note: `QA Dental Order ${DATE_TAG}`,
  49  |     };
  50  | 
  51  |     const { status, data } = await apiRequest('POST', '/laboratory/order/create', orderData);
  52  |     console.log(`LAB-004 Create: status=${status}, data=${JSON.stringify(data)}`);
> 53  |     expect(status).toBe(200).or(expect(status).toBe(201));
      |                    ^ Error: expect(received).toBe(expected) // Object.is equality
  54  |   });
  55  | });
  56  | 
  57  | test.describe('LAB-005: Get Dental Order By ID', () => {
  58  |   test('should retrieve dental order by ID', async () => {
  59  |     const { data: orderList } = await apiRequest('GET', '/laboratory/order/read');
  60  |     const orders = orderList as Array<{ id: number }>;
  61  |     if (orders.length === 0) {
  62  |       console.log('LAB-005: No orders - BLOCKED');
  63  |       return;
  64  |     }
  65  | 
  66  |     const { status, data } = await apiRequest('GET', `/laboratory/order/read-by-id/${orders[0].id}`);
  67  |     expect(status).toBe(200);
  68  |     console.log(`LAB-005: Order data = ${JSON.stringify(data)}`);
  69  |   });
  70  | });
  71  | 
  72  | test.describe('LAB-006: Get Dental Order By Non-Existent ID', () => {
  73  |   test('should return 404 for non-existent order', async () => {
  74  |     const { status, data } = await apiRequest('GET', '/laboratory/order/read-by-id/999999999');
  75  |     console.log(`LAB-006 Non-existent ID: status=${status}, data=${JSON.stringify(data)}`);
  76  |     expect(status).not.toBe(200);
  77  |   });
  78  | });
  79  | 
  80  | test.describe('LAB-007: Update Dental Order Status', () => {
  81  |   test('should update order status', async () => {
  82  |     const { data: orderList } = await apiRequest('GET', '/laboratory/order/read');
  83  |     const orders = orderList as Array<{ id: number; status?: string }>;
  84  |     if (orders.length === 0) {
  85  |       console.log('LAB-007: No orders - BLOCKED');
  86  |       return;
  87  |     }
  88  | 
  89  |     const { status, data } = await apiRequest('PATCH', '/laboratory/order/status', {
  90  |       id: orders[0].id,
  91  |       status: 'IN_PROGRESS',
  92  |     });
  93  |     console.log(`LAB-007 Status update: status=${status}, data=${JSON.stringify(data)}`);
  94  |   });
  95  | });
  96  | 
  97  | test.describe('LAB-008: Delete Dental Order', () => {
  98  |   test('should delete dental order', async () => {
  99  |     const { data: orderList } = await apiRequest('GET', '/laboratory/order/read');
  100 |     const orders = orderList as Array<{ id: number; note?: string }>;
  101 |     // Find QA test order
  102 |     const qaOrder = orders.find((o) => o.note && String(o.note).includes('QA Dental Order'));
  103 |     if (!qaOrder) {
  104 |       console.log('LAB-008: No QA test order found - BLOCKED');
  105 |       return;
  106 |     }
  107 | 
  108 |     const { status, data } = await apiRequest('DELETE', `/laboratory/order/delete/${qaOrder.id}`);
  109 |     console.log(`LAB-008 Delete: status=${status}, data=${JSON.stringify(data)}`);
  110 |     expect(status).toBe(200).or(expect(status).toBe(204));
  111 |   });
  112 | });
  113 | 
  114 | test.describe('LAB-009: Update Technic Order Price', () => {
  115 |   test('should update technic order price', async () => {
  116 |     const { data: orderList } = await apiRequest('GET', '/laboratory/technic/order/read');
  117 |     const orders = orderList as Array<{ id: number }>;
  118 |     if (orders.length === 0) {
  119 |       console.log('LAB-009: No technic orders - BLOCKED');
  120 |       return;
  121 |     }
  122 | 
  123 |     const { status, data } = await apiRequest('PATCH', `/laboratory/technic/order/${orders[0].id}/price`, {
  124 |       price: 100.0,
  125 |     });
  126 |     console.log(`LAB-009 Price update: status=${status}, data=${JSON.stringify(data)}`);
  127 |   });
  128 | });
  129 | 
  130 | test.describe('LAB-010: Update Technic Order Price - Negative', () => {
  131 |   test('should reject negative price', async () => {
  132 |     const { data: orderList } = await apiRequest('GET', '/laboratory/technic/order/read');
  133 |     const orders = orderList as Array<{ id: number }>;
  134 |     if (orders.length === 0) {
  135 |       console.log('LAB-010: No technic orders - BLOCKED');
  136 |       return;
  137 |     }
  138 | 
  139 |     const { status, data } = await apiRequest('PATCH', `/laboratory/technic/order/${orders[0].id}/price`, {
  140 |       price: -50.0,
  141 |     });
  142 |     console.log(`LAB-010 Negative price: status=${status}, data=${JSON.stringify(data)}`);
  143 |     if (status === 200) {
  144 |       console.log('⚠️  BUG-CANDIDATE: Backend accepts negative price for technic order');
  145 |     }
  146 |   });
  147 | });
  148 | 
  149 | test.describe('LAB-011: Update Technic Order Price - Zero', () => {
  150 |   test('should handle zero price', async () => {
  151 |     const { data: orderList } = await apiRequest('GET', '/laboratory/technic/order/read');
  152 |     const orders = orderList as Array<{ id: number }>;
  153 |     if (orders.length === 0) return;
```