import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'No API key configured',
          html: '<div class="p-4 text-sm text-red-600">Add GEMINI_API_KEY to your .env.local<br/>Get free key at: https://aistudio.google.com/</div>'
        },
        { status: 500 }
      )
    }

    // First, check if this is actually an app-building request
    const checkResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Is this a request to BUILD/CREATE/MAKE an application or UI? Answer only "YES" or "NO".

Request: "${prompt}"

Examples:
- "build a todo app" → YES
- "create a calculator" → YES
- "make a weather widget" → YES
- "what is taj mahal?" → NO
- "how does sorting work?" → NO
- "explain react" → NO

Answer:`
            }]
          }]
        }),
      }
    )

    const checkData = await checkResponse.json()
    const isAppRequest = checkData.candidates[0].content.parts[0].text.trim().toUpperCase().includes('YES')

    if (!isAppRequest) {
      return NextResponse.json({
        html: '<div class="p-6 text-center text-neutral-400"><div class="text-sm">This doesn\'t look like an app-building request. Try something like "build a todo app" or "create a dashboard".</div></div>'
      })
    }

    // Call Google Gemini to generate HTML mockup
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a clean, minimal visual HTML mockup for: "${prompt}".

CRITICAL REQUIREMENTS:
- Use DARK theme colors: bg-neutral-900, bg-neutral-800, text-neutral-100, text-neutral-400
- Return ONLY the HTML, no explanations or markdown code blocks
- Use Tailwind CSS classes for styling (assume Tailwind is available)
- Create a VISUAL MOCKUP (not functional) that fits in a small preview window
- DO NOT use <img> tags or any external images - use colored divs/boxes instead
- Use text, icons (Unicode symbols), and colored boxes to represent UI elements
- Keep it simple and clean - optimized for small screen viewing
- Maximum 50 lines of HTML
- Do NOT include <html>, <head>, or <body> tags - just the content div

COLOR PALETTE:
- Backgrounds: bg-neutral-900, bg-neutral-800, bg-neutral-950
- Text: text-neutral-100 (main), text-neutral-400 (secondary), text-neutral-500 (muted)
- Borders: border-neutral-700, border-neutral-800
- Accents: bg-blue-600, bg-green-600, bg-purple-600, bg-red-600

VISUAL REPRESENTATION TIPS:
- For images/photos: use colored divs (e.g., <div class="w-16 h-16 bg-neutral-700 rounded-lg"></div>)
- For charts: use colored bars/blocks
- For avatars: use colored circles with initials
- For icons: use Unicode symbols (→ ← ✓ × ★ ☆ ♥ ⚡ 🔍 etc.)
- Keep layout compact and scannable

Example format:
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
</div>`
            }]
          }]
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to generate preview')
    }

    const data = await response.json()
    let html = data.candidates[0].content.parts[0].text
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return NextResponse.json({ html })
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate preview',
        html: '<div class="p-6 text-center text-neutral-600"><div class="text-4xl mb-2">⚠️</div>Error generating preview. Please try again.</div>'
      },
      { status: 500 }
    )
  }
}
