import { NextRequest, NextResponse } from 'next/server'
import { searchSite } from 'app/lib/search'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()
  if (!query) return NextResponse.json([])
  try {
    const results = await searchSite(query, 5)
    return NextResponse.json(results)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
