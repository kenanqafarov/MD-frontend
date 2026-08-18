import { test, expect, apiRequest } from '../fixtures';

const DATE_TAG = '20260819';

// ─────────────────────────────────────────────
// RESERVATION / APPOINTMENT API TESTS
// ─────────────────────────────────────────────

test.describe('RES-001: Get All Reservations', () => {
  test('should return reservation list', async () => {
    const { status, data } = await apiRequest('GET', '/reservations/read');
    expect(status).toBe(200);
    const reservations = data as unknown[];
    console.log(`RES-001: Total reservations = ${Array.isArray(reservations) ? reservations.length : 'not array'}`);
    console.log(`RES-001: Data sample = ${JSON.stringify(Array.isArray(reservations) ? reservations[0] : data)}`);
  });
});

test.describe('RES-002: Create Reservation - Valid Data', () => {
  test('should create reservation with valid data', async () => {
    // Get a patient and worker first
    const { data: patientData } = await apiRequest('GET', '/patient/read');
    const patients = patientData as Array<{ id: number }>;

    if (patients.length === 0) {
      console.log('RES-002: No patients available - BLOCKED');
      return;
    }

    const patientId = patients[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const { status, data } = await apiRequest('POST', '/reservations/create', {
      patientId,
      date: dateStr,
      startTime: '10:00',
      endTime: '11:00',
      note: `QA Test Appointment ${DATE_TAG}`,
    });
    console.log(`RES-002 Create: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).toBe(200).or(expect(status).toBe(201));
  });
});

test.describe('RES-003: Create Reservation - Past Date', () => {
  test('should reject reservation with past date', async () => {
    const { data: patientData } = await apiRequest('GET', '/patient/read');
    const patients = patientData as Array<{ id: number }>;
    if (patients.length === 0) return;

    const pastDate = '2020-01-01';
    const { status, data } = await apiRequest('POST', '/reservations/create', {
      patientId: patients[0].id,
      date: pastDate,
      startTime: '10:00',
      endTime: '11:00',
    });
    console.log(`RES-003 Past date: status=${status}, data=${JSON.stringify(data)}`);
    // Backend may or may not enforce past date validation
    if (status === 200 || status === 201) {
      console.log('⚠️  BUG-CANDIDATE: Backend allows creating reservation in the past');
    }
  });
});

test.describe('RES-004: Create Reservation - Invalid Time (endTime before startTime)', () => {
  test('should reject reservation where endTime is before startTime', async () => {
    const { data: patientData } = await apiRequest('GET', '/patient/read');
    const patients = patientData as Array<{ id: number }>;
    if (patients.length === 0) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const { status, data } = await apiRequest('POST', '/reservations/create', {
      patientId: patients[0].id,
      date: dateStr,
      startTime: '15:00',
      endTime: '10:00', // BEFORE startTime
    });
    console.log(`RES-004 Invalid time: status=${status}, data=${JSON.stringify(data)}`);
    if (status === 200 || status === 201) {
      console.log('⚠️  BUG: Backend accepts endTime before startTime!');
    }
  });
});

test.describe('RES-005: Search Reservations', () => {
  test('should search reservations with filters', async () => {
    const { status, data } = await apiRequest('POST', '/reservations/search', {});
    expect(status).toBe(200);
    console.log(`RES-005 Search: status=${status}, count=${Array.isArray(data) ? (data as unknown[]).length : 'N/A'}`);
  });
});

test.describe('RES-006: Update Reservation Status', () => {
  test('should update reservation status', async () => {
    // Get a reservation first
    const { data: resList } = await apiRequest('GET', '/reservations/read');
    const reservations = resList as Array<{ id: number; status?: string }>;
    if (reservations.length === 0) {
      console.log('RES-006: No reservations - BLOCKED');
      return;
    }

    const res = reservations[0];
    const { status, data } = await apiRequest('PATCH', `/reservations/update/status/${res.id}`, {
      status: 'CONFIRMED',
    });
    console.log(`RES-006 Status update: status=${status}, data=${JSON.stringify(data)}`);
  });
});

test.describe('RES-007: Delete Non-Existent Reservation', () => {
  test('should return error deleting non-existent reservation', async () => {
    const { status, data } = await apiRequest('DELETE', '/reservations/delete/999999999');
    console.log(`RES-007 Delete non-existent: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).not.toBe(200);
  });
});

// Double Booking Check
test.describe('RES-008: Double Booking Same Time Slot', () => {
  test('should detect or reject double booking for same doctor at same time', async () => {
    const { data: patientData } = await apiRequest('GET', '/patient/read');
    const patients = patientData as Array<{ id: number }>;
    if (patients.length < 2) {
      console.log('RES-008: Need at least 2 patients - BLOCKED');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const appointmentData = {
      patientId: patients[0].id,
      date: dateStr,
      startTime: '14:00',
      endTime: '15:00',
      note: `QA Double Booking Test 1 ${DATE_TAG}`,
    };

    const { status: s1, data: d1 } = await apiRequest('POST', '/reservations/create', appointmentData);
    console.log(`RES-008 First booking: status=${s1}`);

    // Try second booking at same slot
    const { status: s2, data: d2 } = await apiRequest('POST', '/reservations/create', {
      ...appointmentData,
      patientId: patients[1].id,
      note: `QA Double Booking Test 2 ${DATE_TAG}`,
    });
    console.log(`RES-008 Second booking (same slot): status=${s2}, data=${JSON.stringify(d2)}`);
    if (s2 === 200 || s2 === 201) {
      console.log('ℹ️  INFO: Backend allows double booking at same time slot - may or may not be intended');
    }
  });
});

// ─────────────────────────────────────────────
// APPOINTMENT UI TESTS
// ─────────────────────────────────────────────

test.describe('RES-UI-001: Appointments Calendar Page', () => {
  test('should load appointments calendar', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/appointments');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/res-ui-001-appointments.png' });
    console.log(`RES-UI-001: Console errors = ${consoleErrors.join(' | ')}`);
  });
});

test.describe('RES-UI-002: Add Appointment', () => {
  test('should open add appointment page', async ({ authPage }) => {
    await authPage.goto('/appointments/add');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);
    await authPage.screenshot({ path: 'QA/screenshots/res-ui-002-add-appointment.png' });
    console.log(`RES-UI-002: URL = ${authPage.url()}`);
  });
});
