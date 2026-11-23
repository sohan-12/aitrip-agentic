import { expect, test } from '@playwright/test'

test('interact with the Earth and fly to a catalog destination', async ({ page }) => {
  await page.goto('/')
  const earth = page.getByRole('group', { name: 'Interactive Earth' })
  const controls = page.getByRole('group', { name: 'Earth controls' })
  await expect(controls).toBeVisible({ timeout: 20_000 })
  await controls.getByRole('button', { name: 'Pause rotation' }).click()
  await expect(controls.getByRole('button', { name: 'Resume rotation' })).toBeVisible()

  await earth.focus()
  for (let step = 0; step < 6; step++) await page.keyboard.press('=')
  await expect(controls.getByRole('button', { name: 'Zoom in' })).toBeDisabled()
  await controls.getByRole('button', { name: 'Reset globe view' }).click()
  await expect(controls.getByRole('button', { name: 'Zoom in' })).toBeEnabled()

  const flyTo = page.getByRole('button', { name: 'Kyoto' })
  await flyTo.click()
  await expect(flyTo).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('link', { name: 'View Kyoto' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kyoto')
})
