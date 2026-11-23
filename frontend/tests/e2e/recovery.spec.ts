import { expect, test } from '@playwright/test'

test('recover from a temporarily unavailable destination catalog', async ({ page }) => {
  const catalogRoute = '**/api/destinations?*'
  await page.route(catalogRoute, route => route.fulfill({ status: 503, body: '' }))
  await page.goto('/explore?q=Kyoto')
  await expect(page.getByText('The destination atlas could not be loaded.')).toBeVisible()
  await page.unroute(catalogRoute)
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('link', { name: /Kyoto/ })).toBeVisible()
})
