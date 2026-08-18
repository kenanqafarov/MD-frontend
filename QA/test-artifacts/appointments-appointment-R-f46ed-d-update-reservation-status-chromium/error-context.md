# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: appointments/appointment.spec.ts >> RES-006: Update Reservation Status >> should update reservation status
- Location: tests/appointments/appointment.spec.ts:101:3

# Error details

```
TypeError: Cannot read properties of undefined (reading 'id')
```

# Test source

```ts
  11  |     const { status, data } = await apiRequest('GET', '/reservations/read');
  12  |     expect(status).toBe(200);
  13  |     const reservations = data as unknown[];
  14  |     console.log(`RES-001: Total reservations = ${Array.isArray(reservations) ? reservations.length : 'not array'}`);
  15  |     console.log(`RES-001: Data sample = ${JSON.stringify(Array.isArray(reservations) ? reservations[0] : data)}`);
  16  |   });
  17  | });
  18  | 
  19  | test.describe('RES-002: Create Reservation - Valid Data', () => {
  20  |   test('should create reservation with valid data', async () => {
  21  |     // Get a patient and worker first
  22  |     const { data: patientData } = await apiRequest('GET', '/patient/read');
  23  |     const patients = patientData as Array<{ id: number }>;
  24  | 
  25  |     if (patients.length === 0) {
  26  |       console.log('RES-002: No patients available - BLOCKED');
  27  |       return;
  28  |     }
  29  | 
  30  |     const patientId = patients[0].id;
  31  | 
  32  |     const tomorrow = new Date();
  33  |     tomorrow.setDate(tomorrow.getDate() + 1);
  34  |     const dateStr = tomorrow.toISOString().split('T')[0];
  35  | 
  36  |     const { status, data } = await apiRequest('POST', '/reservations/create', {
  37  |       patientId,
  38  |       date: dateStr,
  39  |       startTime: '10:00',
  40  |       endTime: '11:00',
  41  |       note: `QA Test Appointment ${DATE_TAG}`,
  42  |     });
  43  |     console.log(`RES-002 Create: status=${status}, data=${JSON.stringify(data)}`);
  44  |     expect(status).toBe(200).or(expect(status).toBe(201));
  45  |   });
  46  | });
  47  | 
  48  | test.describe('RES-003: Create Reservation - Past Date', () => {
  49  |   test('should reject reservation with past date', async () => {
  50  |     const { data: patientData } = await apiRequest('GET', '/patient/read');
  51  |     const patients = patientData as Array<{ id: number }>;
  52  |     if (patients.length === 0) return;
  53  | 
  54  |     const pastDate = '2020-01-01';
  55  |     const { status, data } = await apiRequest('POST', '/reservations/create', {
  56  |       patientId: patients[0].id,
  57  |       date: pastDate,
  58  |       startTime: '10:00',
  59  |       endTime: '11:00',
  60  |     });
  61  |     console.log(`RES-003 Past date: status=${status}, data=${JSON.stringify(data)}`);
  62  |     // Backend may or may not enforce past date validation
  63  |     if (status === 200 || status === 201) {
  64  |       console.log('⚠️  BUG-CANDIDATE: Backend allows creating reservation in the past');
  65  |     }
  66  |   });
  67  | });
  68  | 
  69  | test.describe('RES-004: Create Reservation - Invalid Time (endTime before startTime)', () => {
  70  |   test('should reject reservation where endTime is before startTime', async () => {
  71  |     const { data: patientData } = await apiRequest('GET', '/patient/read');
  72  |     const patients = patientData as Array<{ id: number }>;
  73  |     if (patients.length === 0) return;
  74  | 
  75  |     const tomorrow = new Date();
  76  |     tomorrow.setDate(tomorrow.getDate() + 1);
  77  |     const dateStr = tomorrow.toISOString().split('T')[0];
  78  | 
  79  |     const { status, data } = await apiRequest('POST', '/reservations/create', {
  80  |       patientId: patients[0].id,
  81  |       date: dateStr,
  82  |       startTime: '15:00',
  83  |       endTime: '10:00', // BEFORE startTime
  84  |     });
  85  |     console.log(`RES-004 Invalid time: status=${status}, data=${JSON.stringify(data)}`);
  86  |     if (status === 200 || status === 201) {
  87  |       console.log('⚠️  BUG: Backend accepts endTime before startTime!');
  88  |     }
  89  |   });
  90  | });
  91  | 
  92  | test.describe('RES-005: Search Reservations', () => {
  93  |   test('should search reservations with filters', async () => {
  94  |     const { status, data } = await apiRequest('POST', '/reservations/search', {});
  95  |     expect(status).toBe(200);
  96  |     console.log(`RES-005 Search: status=${status}, count=${Array.isArray(data) ? (data as unknown[]).length : 'N/A'}`);
  97  |   });
  98  | });
  99  | 
  100 | test.describe('RES-006: Update Reservation Status', () => {
  101 |   test('should update reservation status', async () => {
  102 |     // Get a reservation first
  103 |     const { data: resList } = await apiRequest('GET', '/reservations/read');
  104 |     const reservations = resList as Array<{ id: number; status?: string }>;
  105 |     if (reservations.length === 0) {
  106 |       console.log('RES-006: No reservations - BLOCKED');
  107 |       return;
  108 |     }
  109 | 
  110 |     const res = reservations[0];
> 111 |     const { status, data } = await apiRequest('PATCH', `/reservations/update/status/${res.id}`, {
      |                                                                                           ^ TypeError: Cannot read properties of undefined (reading 'id')
  112 |       status: 'CONFIRMED',
  113 |     });
  114 |     console.log(`RES-006 Status update: status=${status}, data=${JSON.stringify(data)}`);
  115 |   });
  116 | });
  117 | 
  118 | test.describe('RES-007: Delete Non-Existent Reservation', () => {
  119 |   test('should return error deleting non-existent reservation', async () => {
  120 |     const { status, data } = await apiRequest('DELETE', '/reservations/delete/999999999');
  121 |     console.log(`RES-007 Delete non-existent: status=${status}, data=${JSON.stringify(data)}`);
  122 |     expect(status).not.toBe(200);
  123 |   });
  124 | });
  125 | 
  126 | // Double Booking Check
  127 | test.describe('RES-008: Double Booking Same Time Slot', () => {
  128 |   test('should detect or reject double booking for same doctor at same time', async () => {
  129 |     const { data: patientData } = await apiRequest('GET', '/patient/read');
  130 |     const patients = patientData as Array<{ id: number }>;
  131 |     if (patients.length < 2) {
  132 |       console.log('RES-008: Need at least 2 patients - BLOCKED');
  133 |       return;
  134 |     }
  135 | 
  136 |     const tomorrow = new Date();
  137 |     tomorrow.setDate(tomorrow.getDate() + 2);
  138 |     const dateStr = tomorrow.toISOString().split('T')[0];
  139 | 
  140 |     const appointmentData = {
  141 |       patientId: patients[0].id,
  142 |       date: dateStr,
  143 |       startTime: '14:00',
  144 |       endTime: '15:00',
  145 |       note: `QA Double Booking Test 1 ${DATE_TAG}`,
  146 |     };
  147 | 
  148 |     const { status: s1, data: d1 } = await apiRequest('POST', '/reservations/create', appointmentData);
  149 |     console.log(`RES-008 First booking: status=${s1}`);
  150 | 
  151 |     // Try second booking at same slot
  152 |     const { status: s2, data: d2 } = await apiRequest('POST', '/reservations/create', {
  153 |       ...appointmentData,
  154 |       patientId: patients[1].id,
  155 |       note: `QA Double Booking Test 2 ${DATE_TAG}`,
  156 |     });
  157 |     console.log(`RES-008 Second booking (same slot): status=${s2}, data=${JSON.stringify(d2)}`);
  158 |     if (s2 === 200 || s2 === 201) {
  159 |       console.log('ℹ️  INFO: Backend allows double booking at same time slot - may or may not be intended');
  160 |     }
  161 |   });
  162 | });
  163 | 
  164 | // ─────────────────────────────────────────────
  165 | // APPOINTMENT UI TESTS
  166 | // ─────────────────────────────────────────────
  167 | 
  168 | test.describe('RES-UI-001: Appointments Calendar Page', () => {
  169 |   test('should load appointments calendar', async ({ authPage }) => {
  170 |     const consoleErrors: string[] = [];
  171 |     authPage.on('console', (msg) => {
  172 |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  173 |     });
  174 | 
  175 |     await authPage.goto('/appointments');
  176 |     await authPage.waitForLoadState('networkidle');
  177 |     await authPage.waitForTimeout(3000);
  178 | 
  179 |     await authPage.screenshot({ path: 'QA/screenshots/res-ui-001-appointments.png' });
  180 |     console.log(`RES-UI-001: Console errors = ${consoleErrors.join(' | ')}`);
  181 |   });
  182 | });
  183 | 
  184 | test.describe('RES-UI-002: Add Appointment', () => {
  185 |   test('should open add appointment page', async ({ authPage }) => {
  186 |     await authPage.goto('/appointments/add');
  187 |     await authPage.waitForLoadState('networkidle');
  188 |     await authPage.waitForTimeout(3000);
  189 |     await authPage.screenshot({ path: 'QA/screenshots/res-ui-002-add-appointment.png' });
  190 |     console.log(`RES-UI-002: URL = ${authPage.url()}`);
  191 |   });
  192 | });
  193 | 
```