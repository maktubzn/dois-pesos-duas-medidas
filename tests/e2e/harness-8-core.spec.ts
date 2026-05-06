import { expect, test, type Page } from '@playwright/test'

async function loginAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('[data-admin-sidebar="true"]')).toBeVisible()
}

test('harness 8 input, countdown and sidebar work through public UI', async ({ browser }) => {
  test.setTimeout(90_000)
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const admin = await context.newPage()
  const stage = await context.newPage()

  await stage.goto('/stage')
  await loginAdmin(admin)

  for (const section of ['Pre-show', 'Partida', 'Tribunal', 'Historico', 'Tecnico', 'Operacao']) {
    await admin.getByRole('button', { name: section, exact: true }).click()
    await expect(admin.getByRole('button', { name: section, exact: true })).toHaveAttribute('aria-current', 'page')
  }
  await expect(admin.locator('details[aria-label="Tecnico avancado"]')).not.toHaveAttribute('open', '')
  await admin.getByRole('button', { name: 'Tecnico', exact: true }).click()
  await expect(admin.locator('details[aria-label="Tecnico avancado"]')).toHaveAttribute('open', '')
  await expect(admin.locator('[data-admin-command-grid="true"]')).not.toContainText('RESET_HW')

  await admin.getByRole('button', { name: 'Operacao', exact: true }).click()
  await admin.getByRole('button', { name: 'Testar mesa', exact: true }).click()
  await expect(stage.locator('[data-preshow-scene="how_to_play_tribunal"]')).toBeVisible()
  await expect(stage.getByText('Antes do julgamento, teste das mesas.')).toBeVisible()
  await expect(stage.locator('[data-preshow-scene="button_check"]')).toBeVisible({ timeout: 14_000 })
  await expect(stage.getByText('Mesa A, pressione o botao de vez.')).toBeVisible()
  await admin.keyboard.press('z')
  await expect(stage.getByRole('heading', { name: 'Mesa A reconhecida' })).toBeVisible({ timeout: 5_000 })
  await admin.getByRole('button', { name: 'Pedir proximo sinal', exact: true }).click()
  await admin.keyboard.press('m')
  await expect(stage.getByRole('heading', { name: 'Mesa B reconhecida' })).toBeVisible({ timeout: 5_000 })

  await admin.getByRole('button', { name: 'Avancar para pronto', exact: true }).click()
  await admin.getByRole('button', { name: 'Iniciar quiz', exact: true }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_prepare', { timeout: 8_000 })

  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_countdown', { timeout: 8_000 })

  await admin.keyboard.press('z')
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_countdown')

  await admin.getByRole('button', { name: 'Pular countdown' }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'buzz_open', { timeout: 8_000 })
  await admin.keyboard.press('z')
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'team_answering', { timeout: 5_000 })
  await expect(stage.getByText('COM A PALAVRA')).toBeVisible()

  await context.close()
})
