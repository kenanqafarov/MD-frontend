## TODO - Patient report auto-refresh

- [ ] Update `src/pages/patient/Treatment/index.jsx`:
  - After successful `onConfirmSelection` (Əməliyyatlar uğurla təsdiqləndi!) write a localStorage refresh token for that patient.
- [ ] Update `src/pages/patient/PatientReport.jsx`:
  - On mount and whenever the refresh token changes, call `loadReports()`.
  - Listen to `storage` event.
- [ ] Manual test:
  - Confirm treatment in `#/patients/patient/2/plans`.
  - Open `#/patients/patient/2/report` and verify updated rows.
  - Keep report open and confirm treatment, verify it refreshes automatically.

