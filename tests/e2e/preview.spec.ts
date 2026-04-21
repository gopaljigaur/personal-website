import { test, expect } from '@playwright/test'

test.describe('Link preview', () => {
  test.skip(({ isMobile }) => isMobile, 'previews hidden on mobile')

  test('shows preview card after hovering external link for 1s', async ({
    page,
  }) => {
    await page.goto('/blog')

    const firstPost = page.locator('a[href^="/blog/"]').first()
    await firstPost.click()
    await page.waitForLoadState('networkidle')

    // Find first external link in article
    const externalLink = page.locator('article a[href^="http"]').first()
    const count = await externalLink.count()
    if (count === 0) {
      test.skip()
      return
    }

    await externalLink.hover()
    // Card should not be visible immediately
    const card = page.locator('[class*="fixed"][class*="z-50"]').first()
    await expect(card).not.toBeVisible()

    // Wait for 1s delay
    await page.waitForTimeout(1100)
    await expect(card).toBeVisible()
  })

  test('preview disappears on mouse leave', async ({ page }) => {
    await page.goto('/blog')
    const firstPost = page.locator('a[href^="/blog/"]').first()
    await firstPost.click()
    await page.waitForLoadState('networkidle')

    const externalLink = page.locator('article a[href^="http"]').first()
    if ((await externalLink.count()) === 0) {
      test.skip()
      return
    }

    await externalLink.hover()
    await page.waitForTimeout(1100)

    // Move away
    await page.mouse.move(0, 0)
    const card = page.locator('[class*="fixed"][class*="z-50"]').first()
    await expect(card).not.toBeVisible()
  })
})

test.describe('Post preview link', () => {
  test.skip(({ isMobile }) => isMobile, 'previews hidden on mobile')

  test('shows post preview on blog-to-blog link hover', async ({ page }) => {
    await page.goto('/blog')

    // Find a post, open it
    const firstPost = page.locator('a[href^="/blog/"]').first()
    await firstPost.click()
    await page.waitForLoadState('networkidle')

    // Find internal blog link
    const internalLink = page.locator('article a[href^="/blog/"]').first()
    if ((await internalLink.count()) === 0) {
      test.skip()
      return
    }

    await internalLink.hover()
    await page.waitForTimeout(1100)

    const card = page.locator('[class*="fixed"][class*="z-50"]').first()
    await expect(card).toBeVisible()
  })
})
