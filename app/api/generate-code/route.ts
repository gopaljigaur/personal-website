import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, theme } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Use provided theme or fallback to defaults
    const bgColor = theme?.bg || '#030608'
    const textColor = theme?.text || '#e1ecf3'

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Service unavailable',
          html: '<div class="p-6 text-center text-neutral-400"><div class="text-4xl mb-2">⚠️</div><div class="text-sm">Service temporarily unavailable</div></div>',
        },
        { status: 500 },
      )
    }

    // Call Google Gemini to generate HTML mockup or reject non-app requests
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an app mockup generator. First, determine if this is a request to BUILD/CREATE/MAKE an application or UI.

Request: "${prompt}"

If this is NOT an app-building request (e.g., "what is taj mahal?", "how does sorting work?", "explain react"), respond with:
<div class="p-6 text-center text-neutral-400"><div class="text-sm">This doesn't look like an app-building request. Try something like "build a todo app" or "create a dashboard".</div></div>

If this IS an app-building request, generate a clean, minimal visual HTML mockup.

CRITICAL REQUIREMENTS:
- Use the provided theme colors: background "${bgColor}", text "${textColor}"
- Return ONLY the HTML, no explanations or markdown code blocks
- Use Tailwind CSS classes for styling (assume Tailwind is available)
- Create a VISUAL MOCKUP (not functional) that fits in a small preview window
- DO NOT use <img> tags or any external images - use colored divs/boxes instead
- Use text, icons (Unicode symbols), and colored boxes to represent UI elements
- Keep it simple and clean - optimized for small screen viewing
- Maximum 50 lines of HTML
- Do NOT include <html>, <head>, or <body> tags - just the content div

COLOR PALETTE (use Tailwind classes that match these colors):
- Main background: bg-neutral-900 (approx ${bgColor})
- Secondary background: bg-neutral-800
- Main text: text-neutral-100 (approx ${textColor})
- Secondary text: text-neutral-400
- Borders: border-neutral-700, border-neutral-800
- Accents: bg-blue-600, bg-green-600, bg-purple-600, bg-red-600

VISUAL REPRESENTATION TIPS:
- For images/photos: use colored divs (e.g., <div class="w-16 h-16 bg-neutral-700 rounded-lg"></div>)
- For charts: use colored bars/blocks
- For avatars: use colored circles with initials
- For icons: use Unicode symbols (→ ← ✓ × ★ ☆ ♥ ⚡ 🔍 etc.)
- Keep layout compact and scannable

Example format for app-building requests:
<div class="w-full h-full bg-neutral-900 text-neutral-100">
  <div class="border-b border-neutral-800 px-4 py-3">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold">App Name</h1>
      <button class="px-3 py-1.5 bg-blue-600 rounded text-sm">Action</button>
    </div>
  </div>
  <div class="p-4 space-y-3">
    <div class="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
      <div class="w-12 h-12 bg-blue-600 rounded"></div>
      <div class="flex-1">
        <div class="font-medium">Item Title</div>
        <div class="text-sm text-neutral-400">Description</div>
      </div>
    </div>
  </div>
</div>`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to generate preview')
    }

    const data = await response.json()
    const html = data.candidates[0].content.parts[0].text
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return NextResponse.json({ html })
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate preview',
        html: '<div class="p-6 text-center text-neutral-600"><div class="text-4xl mb-2">⚠️</div>Error generating preview. Please try again.</div>',
      },
      { status: 500 },
    )
  }
}
