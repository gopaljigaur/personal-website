import fs from 'fs'
import path from 'path'

export type SearchResult = {
  type: 'blog' | 'project' | 'profile' | 'contact'
  title: string
  url: string
  text: string
  score: number
}

type EmbeddingItem = {
  id: string
  type: 'blog' | 'project' | 'profile' | 'contact'
  title: string
  url: string
  text: string
  embedding: number[]
}

function dot(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

async function embedQuery(query: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: query }] },
      }),
    },
  )
  const data = (await res.json()) as { embedding: { values: number[] } }
  return data.embedding.values
}

export const EMBEDDINGS_PATH = path.join(
  process.cwd(),
  'content/embeddings.json',
)

let _embeddings: EmbeddingItem[] | null = null
function loadEmbeddings(): EmbeddingItem[] {
  if (_embeddings) return _embeddings
  if (!fs.existsSync(EMBEDDINGS_PATH)) return []
  _embeddings = JSON.parse(
    fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'),
  ) as EmbeddingItem[]
  return _embeddings
}

export async function searchSite(
  query: string,
  topN = 3,
): Promise<SearchResult[]> {
  const items = loadEmbeddings()
  if (items.length === 0) return []

  const queryEmbedding = await embedQuery(query)

  const THRESHOLD = 0.55

  return items
    .map((item) => ({
      type: item.type,
      title: item.title,
      url: item.url,
      text: item.text,
      score: dot(queryEmbedding, item.embedding),
    }))
    .filter((item) => item.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
