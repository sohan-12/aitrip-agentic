import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', hasTouch: true })

test('use the atlas on a narrow screen without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext, {
      apply(target, canvas, args) {
        return /webgl/i.test(args[0]) ? null : Reflect.apply(target, canvas, args)
      },
    })
  })
  await page.goto('/')
  const earth = page.getByRole('img', { name: /satellite view of earth/i })
  await expect(earth).toBeVisible()
  expect(await earth.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)

  const search = page.getByRole('searchbox', { name: 'Search destinations' })
  await search.fill('destination with no match')
  await search.press('Enter')
  await expect(page.getByText('No matching destinations.')).toBeVisible()
  await search.fill('Kyoto')
  await search.press('Enter')
  await expect(page.getByRole('link', { name: /Kyoto/ })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
