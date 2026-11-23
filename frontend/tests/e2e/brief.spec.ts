import { expect, test } from '@playwright/test'

test('find a destination and save and reopen a private trip brief', async ({ page, browser }) => {
  await page.goto('/')
  await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Ooty')
  await page.getByRole('button', { name: 'Search the atlas' }).click()
  const destination = page.getByRole('link', { name: /Ooty/ })
  await expect(destination).toBeVisible()
  await destination.click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ooty')

  const planLink = page.locator('main a[href*="/planner?destination=ooty"]')
  await planLink.click()
  const prompt = 'Plan four days in Ooty for two travelers who prefer trains and vegetarian meals, within ₹15,000.'
  await page.getByRole('textbox', { name: 'Your trip brief' }).fill(prompt)
  const createResponse = page.waitForResponse(response => response.url().endsWith('/api/briefs') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Save trip brief' }).click()
  const created = await createResponse
  expect(created.status()).toBe(201)
  const { id, token, destination_slug } = await created.json()
  expect(destination_slug).toBe('ooty')
  await expect(page).toHaveURL(new RegExp('/planner/briefs/' + id + '$'))
  expect(page.url()).not.toContain(token)
  await expect(page.getByText(prompt, { exact: true })).toBeVisible()

  await page.goto('/planner')
  const retrieveResponse = page.waitForResponse(response => response.url().endsWith('/api/briefs/' + id))
  await page.getByRole('link', { name: /reopen last brief/i }).click()
  expect((await retrieveResponse).ok()).toBe(true)
  await expect(page.getByText(prompt, { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText(prompt, { exact: true })).toBeVisible()

  const otherTab = await browser.newPage()
  try {
    await otherTab.goto(page.url())
    await expect(otherTab.getByText('This brief can only be opened in the tab where it was saved.')).toBeVisible()
    await expect(otherTab.getByText(prompt, { exact: true })).toHaveCount(0)
    expect((await otherTab.request.get(new URL('/api/briefs/' + id, page.url()).href)).ok()).toBe(false)
  } finally {
    await otherTab.close()
  }
})
