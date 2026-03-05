const { test, expect } = require('@playwright/test');
const path = require('path');

// Verify that the streaming example initializes and reports a backend
// other than the placeholder values.
test('simple streaming demo loads and initializes', async ({ page }) => {
  const filePath = path.join(__dirname, '../docs/examples/simple-streaming.html');
  await page.goto('file://' + filePath);
  const backend = page.locator('#backendType');
  await expect(backend).not.toHaveText(/Loading|Error/, { timeout: 20000 });
});
