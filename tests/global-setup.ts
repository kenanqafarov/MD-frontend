import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_API = 'http://169.58.183.137:5555/api/v1';
const BASE_URL = 'http://169.58.183.137:8080';
const USERNAME = 'super_admin';
const PASSWORD = 'super1234';

async function globalSetup() {
  // Ensure directories exist
  const dirs = [
    'QA/test-results',
    'QA/screenshots',
    'QA/traces',
    'QA/test-artifacts',
    'playwright/.auth',
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Get token via API
  const response = await fetch(`${BASE_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  const data = await response.json();
  const accessToken = data.tokenPair?.accessToken;
  const refreshToken = data.tokenPair?.refreshToken;

  if (!accessToken) {
    throw new Error('Failed to get auth token in global setup');
  }

  // Launch browser and store auth state
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Inject tokens into localStorage
  await page.evaluate(
    ({ token, refresh }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refresh);
    },
    { token: accessToken, refresh: refreshToken }
  );

  // Save storage state
  await context.storageState({ path: 'playwright/.auth/user.json' });
  await browser.close();

  // Save tokens for API tests
  const tokenData = { accessToken, refreshToken, username: USERNAME };
  fs.writeFileSync('playwright/.auth/tokens.json', JSON.stringify(tokenData, null, 2));

  console.log('✅ Global setup complete - auth state saved');
}

export default globalSetup;
