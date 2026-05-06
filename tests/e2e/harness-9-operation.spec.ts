import { expect, test, type Page } from '@playwright/test'

async function loginAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('[data-admin-sidebar="true"]')).toBeVisible()
}

test('harness 9 prepares hardware on next round and countdown reaches buzz_open without serial', async ({ browser }) => {
  test.setTimeout(90_000)
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const admin = await context.newPage()
  const stage = await context.newPage()

  await stage.goto('/stage')
  await loginAdmin(admin)

  await admin.getByRole('button', { name: 'Avancar para pronto', exact: true }).click()
  await admin.getByRole('button', { name: 'Iniciar quiz', exact: true }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_prepare', { timeout: 8_000 })

  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_countdown', { timeout: 8_000 })
  await admin.getByRole('button', { name: 'Pular countdown' }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'buzz_open', { timeout: 8_000 })

  await admin.getByRole('button', { name: 'Mesa A', exact: true }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'team_answering', { timeout: 5_000 })
  await admin.getByRole('button', { name: 'Marcar correto' }).first().click()
  await expect(admin.locator('[data-phase="round_end"]')).toBeVisible({ timeout: 6_000 })
  await expect(admin.getByText('10 x 0').first()).toBeVisible()
  await expect(stage.getByLabel('Placar dos grupos')).toContainText('10')
  await expect(stage.getByLabel('Placar dos grupos')).toContainText('0')

  await admin.getByRole('button', { name: 'Proxima rodada' }).first().click()
  await expect(admin.locator('body')).toContainText('ROUND_NEXT_CLICKED', { timeout: 3_000 })
  await expect(admin.locator('body')).toContainText('ROUND_HARDWARE_PREPARE_START', { timeout: 3_000 })
  await expect(admin.locator('body')).toContainText(/ROUND_HARDWARE_PREPARE_(OK|WARN)/, { timeout: 5_000 })
  await expect(admin.getByText('10 x 0').first()).toBeVisible()

  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_countdown', { timeout: 8_000 })
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'buzz_open', { timeout: 10_000 })
  await expect(admin.locator('body')).toContainText('COUNTDOWN_TRANSITION_DONE', { timeout: 3_000 })

  await context.close()
})
