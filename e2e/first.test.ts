import { BrowserContext } from '@playwright/test';
import { test, expect } from './fixtures';

//chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe/popup.html#/login
const TEST_PHRASE =
  'comfort ten front cycle churn burger oak absent rice ice urge result art couple benefit cabbage frequent obscure hurry trick segment cool job debate';
const TEST_PASS = 'testnet1312';

const penumbra = Symbol.for('penumbra');

async function onboarding(context: BrowserContext, extensionId: string) {
  const extPopup = await context.newPage();
  await extPopup.goto(`chrome-extension://${extensionId}/popup.html`);

  // onboarding flow
  const onboarding = await context.waitForEvent('page', {
    predicate: page => page.url().includes('page.html'),
  });

  const button = onboarding.locator('button').getByText('Import existing wallet');
  await button.click();

  await onboarding.evaluate(`navigator.clipboard.writeText('${TEST_PHRASE}')`);

  const phraseLength = onboarding.locator('button').getByText('24 words');
  await phraseLength.click();

  const inputPhrase = onboarding.locator('input').first();
  await inputPhrase.pressSequentially(TEST_PHRASE);

  const finishPhrase = onboarding.locator('button').getByText('Fill in passphrase');
  await finishPhrase.click();

  const enterPassword = onboarding.locator('input').first();
  await enterPassword.fill(TEST_PASS);
  const confirmPassword = onboarding.locator('input').all()[1];
  await confirmPassword.fill(TEST_PASS);

  await onboarding.locator('button').getByText('Next').click();
  await expect(onboarding.getByText('Account created')).toBeVisible({
    timeout: 15000,
  });

  // login
  await extPopup.reload();
  await extPopup.locator('input').fill(TEST_PASS);
  await extPopup.locator('button').getByText('Unlock').click();

  return { extPopup };
}

function getPopup(context: BrowserContext) {
  const pages = context.pages();
  const [extPopup] = pages.filter(page => page.url().includes('popup'));
  return { extPopup };
}

test.beforeAll(async ({ context, extensionId }) => {
  await onboarding(context, extensionId);
});

test.describe('', () => {
  test('penumbra global injected', async ({ context }) => {
    const dappPage = await context.newPage();
    await dappPage.goto('/');

    const penumbraInjected = await dappPage.evaluate(() => typeof window[penumbra] === 'object');
    expect(penumbraInjected).toBeTruthy();
  });

  test('dapp assets displayed', async ({ context }) => {
    const dappPage = await context.newPage();
    await dappPage.goto('/');

    const assetsHeader = dappPage.locator('h2').getByText('Account #');
    await expect(assetsHeader).toBeVisible();
  });
});
