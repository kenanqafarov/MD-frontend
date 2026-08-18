import { test, expect, apiRequest } from '../fixtures';

const DATE_TAG = '20260819';

// ─────────────────────────────────────────────
// PATIENT API TESTS
// ─────────────────────────────────────────────

let createdPatientId: number | null = null;

test.describe('PAT-001: Get All Patients', () => {
  test('should return list of patients', async () => {
    const { status, data } = await apiRequest('GET', '/patient/read');
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    const patients = data as unknown[];
    console.log(`PAT-001: Total patients = ${patients.length}`);
  });
});

test.describe('PAT-002: Create Patient - Valid Data', () => {
  test('should create a patient with valid data', async () => {
    const patientData = {
      name: `QA Patient ${DATE_TAG}`,
      surname: 'Test001',
      fatherName: 'QA',
      phone: '+994501234567',
      gender: 'MALE',
      birthDate: '1990-01-15',
      address: 'QA Test Address, Baku',
    };

    const { status, data } = await apiRequest('POST', '/patient/create', patientData);
    console.log(`PAT-002 Create Response: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).toBe(200).or(expect(status).toBe(201));
    if (status === 200 || status === 201) {
      const patient = data as { id?: number };
      if (patient.id) {
        createdPatientId = patient.id;
        console.log(`PAT-002: Created patient ID = ${createdPatientId}`);
      }
    }
  });
});

test.describe('PAT-003: Create Patient - Missing Required Fields', () => {
  test('should fail when name is missing', async () => {
    const { status, data } = await apiRequest('POST', '/patient/create', {
      surname: 'TestSurname',
      phone: '+994501234568',
      gender: 'MALE',
    });
    expect(status).not.toBe(200);
    expect(status).not.toBe(201);
    console.log(`PAT-003 Missing name: status=${status}, data=${JSON.stringify(data)}`);
  });
});

test.describe('PAT-004: Create Patient - Empty String Fields', () => {
  test('should reject empty name', async () => {
    const { status, data } = await apiRequest('POST', '/patient/create', {
      name: '',
      surname: 'Test',
      gender: 'MALE',
    });
    expect(status).not.toBe(200);
    console.log(`PAT-004 Empty name: status=${status}, data=${JSON.stringify(data)}`);
  });
});

test.describe('PAT-005: Create Patient - Invalid Phone', () => {
  test('should handle invalid phone format', async () => {
    const { status, data } = await apiRequest('POST', '/patient/create', {
      name: 'QA TestPatient',
      surname: 'Invalid',
      phone: 'not-a-phone',
      gender: 'MALE',
    });
    console.log(`PAT-005 Invalid phone: status=${status}, data=${JSON.stringify(data)}`);
    // Phone may or may not be validated - record result
  });
});

test.describe('PAT-006: Create Patient - Very Long Name', () => {
  test('should handle very long name gracefully', async () => {
    const longName = 'A'.repeat(500);
    const { status, data } = await apiRequest('POST', '/patient/create', {
      name: longName,
      surname: 'Test',
      gender: 'MALE',
    });
    expect(status).not.toBe(500);
    console.log(`PAT-006 Long name: status=${status}`);
  });
});

test.describe('PAT-007: Create Patient - Special Characters', () => {
  test('should handle special chars in name', async () => {
    const { status, data } = await apiRequest('POST', '/patient/create', {
      name: "İsmayıl Əliyev",
      surname: 'Qafarov',
      gender: 'MALE',
      phone: '+994551234567',
    });
    console.log(`PAT-007 Special chars: status=${status}, data=${JSON.stringify(data)}`);
    // Azerbaijani chars should work
  });
});

test.describe('PAT-008: Get Patient By ID', () => {
  test('should retrieve patient by valid ID', async () => {
    // First get list to find an ID
    const { status: listStatus, data: listData } = await apiRequest('GET', '/patient/read');
    expect(listStatus).toBe(200);
    const patients = listData as Array<{ id: number }>;
    if (patients.length > 0) {
      const id = patients[0].id;
      const { status, data } = await apiRequest('GET', `/patient/read-by-id/${id}`);
      expect(status).toBe(200);
      console.log(`PAT-008: Patient data = ${JSON.stringify(data)}`);
    } else {
      console.log('PAT-008: No patients found to test');
    }
  });
});

test.describe('PAT-009: Get Patient By Non-Existent ID', () => {
  test('should return 404 for non-existent patient ID', async () => {
    const { status, data } = await apiRequest('GET', '/patient/read-by-id/999999999');
    console.log(`PAT-009 Non-existent ID: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).toBe(404).or(expect(status).toBe(400));
  });
});

test.describe('PAT-010: Get Patient By Invalid UUID', () => {
  test('should handle invalid ID format', async () => {
    const { status, data } = await apiRequest('GET', '/patient/read-by-id/not-a-valid-id');
    console.log(`PAT-010 Invalid ID format: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).not.toBe(500);
  });
});

test.describe('PAT-011: Search Patients', () => {
  test('should search patients by name', async () => {
    const { status, data } = await apiRequest('POST', '/patient/search', {
      name: 'QA Patient',
    });
    expect(status).toBe(200);
    console.log(`PAT-011: Search results = ${JSON.stringify(data)}`);
  });
});

test.describe('PAT-012: Search Patients - Empty Query', () => {
  test('should return results for empty search', async () => {
    const { status, data } = await apiRequest('POST', '/patient/search', {});
    console.log(`PAT-012 Empty search: status=${status}, count=${Array.isArray(data) ? (data as unknown[]).length : 'N/A'}`);
    expect(status).toBe(200);
  });
});

test.describe('PAT-013: Update Patient', () => {
  test('should update patient data', async () => {
    const { data: listData } = await apiRequest('GET', '/patient/read');
    const patients = listData as Array<{ id: number; name: string }>;
    if (patients.length > 0) {
      const patient = patients[0];
      const { status, data } = await apiRequest('PUT', '/patient/update', {
        ...patient,
        address: 'QA Updated Address',
      });
      console.log(`PAT-013 Update: status=${status}, data=${JSON.stringify(data)}`);
      expect(status).toBe(200);
    }
  });
});

test.describe('PAT-014: Delete Patient - Non-Existent', () => {
  test('should return error when deleting non-existent patient', async () => {
    const { status, data } = await apiRequest('DELETE', '/patient/delete/999999999');
    console.log(`PAT-014 Delete non-existent: status=${status}, data=${JSON.stringify(data)}`);
    expect(status).not.toBe(200);
  });
});

test.describe('PAT-015: Export Patients to Excel', () => {
  test('should export patients to Excel', async () => {
    const { status } = await apiRequest('GET', '/patient/export/excel');
    console.log(`PAT-015 Excel export: status=${status}`);
    // Excel export should succeed
    expect(status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// PATIENT UI TESTS
// ─────────────────────────────────────────────

test.describe('PAT-UI-001: Patient List Page', () => {
  test('should load patient list page', async ({ authPage }) => {
    const consoleErrors: string[] = [];
    authPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    await authPage.screenshot({ path: 'QA/screenshots/pat-ui-001-patient-list.png' });
    console.log(`PAT-UI-001: Console errors = ${consoleErrors.join(' | ')}`);

    const pageTitle = await authPage.title();
    console.log(`PAT-UI-001: Page title = ${pageTitle}`);
  });
});

test.describe('PAT-UI-002: Add Patient Form', () => {
  test('should open add patient form', async ({ authPage }) => {
    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);

    // Look for add button
    const addBtn = authPage.locator('button:has-text("Əlavə et"), button:has-text("Yeni"), a[href*="add-patient"], button:has-text("Add")');
    if ((await addBtn.count()) > 0) {
      await addBtn.first().click();
      await authPage.waitForTimeout(2000);
      await authPage.screenshot({ path: 'QA/screenshots/pat-ui-002-add-patient-form.png' });
      console.log(`PAT-UI-002: Add form opened, URL = ${authPage.url()}`);
    } else {
      console.log('PAT-UI-002: Add button not found');
      await authPage.screenshot({ path: 'QA/screenshots/pat-ui-002-no-add-button.png' });
    }
  });
});

test.describe('PAT-UI-003: Patient Search', () => {
  test('should search patients from UI', async ({ authPage }) => {
    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    const searchInput = authPage.locator('input[placeholder*="Axtar"], input[placeholder*="search"], input[type="search"]').first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill('QA Patient');
      await authPage.waitForTimeout(2000);
      await authPage.screenshot({ path: 'QA/screenshots/pat-ui-003-search.png' });
      console.log('PAT-UI-003: Search executed');
    } else {
      console.log('PAT-UI-003: Search input not found');
      await authPage.screenshot({ path: 'QA/screenshots/pat-ui-003-no-search.png' });
    }
  });
});

test.describe('PAT-UI-004: Cache Stale Data Test', () => {
  test('should detect potential stale cache issue', async ({ authPage }) => {
    // Check if patients_cache in localStorage
    await authPage.goto('/patients');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(3000);

    const cacheData = await authPage.evaluate(() => {
      const cache = localStorage.getItem('patients_cache');
      const cacheTs = localStorage.getItem('patients_cache_timestamp');
      return {
        hasCacheData: !!cache,
        cacheLength: cache ? JSON.parse(cache).length : 0,
        cacheAge: cacheTs ? (Date.now() - parseInt(cacheTs)) / 1000 : null,
      };
    });

    console.log(`PAT-UI-004: Cache info = ${JSON.stringify(cacheData)}`);
    // BUG NOTE: readPatients uses localStorage cache - stale data possible
    // Cache age > 5 mins but still shown = potential bug
  });
});
