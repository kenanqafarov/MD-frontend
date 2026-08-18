import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';

const BASE_API = 'http://169.58.183.137:5555/api/v1';

export interface TestFixtures {
  authPage: Page;
  apiToken: string;
  authContext: BrowserContext;
}

// Read token helper
export function getAuthToken(): string {
  try {
    const data = JSON.parse(fs.readFileSync('playwright/.auth/tokens.json', 'utf8'));
    return data.accessToken;
  } catch {
    return '';
  }
}

// API helper with auth
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<{ status: number; data: unknown }> {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_API}${endpoint}`, options);
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { status: response.status, data };
}

// Extend base test with fixtures
export const test = base.extend<TestFixtures>({
  authContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    await use(context);
    await context.close();
  },
  authPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(`PageError: ${err.message}`);
    });
    await use(page);
    if (consoleErrors.length > 0) {
      console.log(`⚠️  Console errors on page: ${consoleErrors.join(' | ')}`);
    }
    await context.close();
  },
  apiToken: async ({}, use) => {
    const token = getAuthToken();
    await use(token);
  },
});

export { expect };
export { BASE_API };
