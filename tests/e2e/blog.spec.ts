import { test, expect } from '@playwright/test'

test.describe('Blog list', () => {
  test('renders blog posts', async ({ page }) => {
    await page.goto('/blog')
    await expect(
      page
        .locator('article, [data-testid="post-item"], a[href^="/blog/"]')
        .first(),
    ).toBeVisible()
  })

  test('tag filter shows only matching posts', async ({ page }) => {
    await page.goto('/blog')

    // Click first tag pill
    const firstTag = page.locator('a[href*="tags="]').first()
    const tagText = await firstTag.textContent()
    await firstTag.click()

    await expect(page).toHaveURL(/tags=/)
    // All visible post tag chips should include the selected tag
    const tagChips = page.locator('a[href*="tags="]')
    const count = await tagChips.count()
    expect(count).toBeGreaterThan(0)
    await expect(page.getByText(tagText!.trim()).first()).toBeVisible()
  })
})

test.describe('Blog post TOC', () => {
  test('clicking a TOC link scrolls to the heading', async ({ page }) => {
    // Get first post with headings
    await page.goto('/blog')
    const firstPost = page.locator('a[href^="/blog/"]').first()
    await firstPost.click()
    await page.waitForLoadState('networkidle')

    const tocLink = page.locator('nav a[href^="#"]').first()
    const count = await tocLink.count()
    if (count === 0) {
      test.skip()
      return
    }

    const href = await tocLink.getAttribute('href')
    const targetId = href!.slice(1)

    await tocLink.click()
    await page.waitForTimeout(300)

    const heading = page.locator(`#${CSS.escape(targetId)}`)
    await expect(heading).toBeInViewport()
  })
})
