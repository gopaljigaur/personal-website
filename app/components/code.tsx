'use client'

import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { codeToHast } from 'shiki'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { GoCopy, GoCheck, GoArrowUpRight } from 'react-icons/go'
import type { Root, RootContent } from 'hast'

interface OpenGistCodeProps {
  url: string
}

interface GistData {
  code: string
  language: string
}

export function Code({ children, ...props }) {
  const [copied, setCopied] = useState(false)
  const [element, setElement] = useState(null)

  useEffect(() => {
    const highlight = async () => {
      const hast = await codeToHast(children, {
        lang: props.language,
        theme: 'dark-plus',
      })

      const preElement: RootContent = hast.children[0]
      const codeElement = (preElement as unknown as Root).children[0]

      const jsxElement = toJsxRuntime(codeElement, {
        Fragment,
        jsx,
        jsxs,
      })

      setElement(jsxElement)
    }

    highlight()
  }, [children, props.language])

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!element) return null

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-1 right-0 z-10 cursor-pointer rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800"
      >
        {copied ? (
          <GoCheck className="stroke-1 text-green-600" />
        ) : (
          <GoCopy className="stroke-1" />
        )}
      </button>
      {element}
    </div>
  )
}

const fetchGistCode = async (url: string): Promise<GistData> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`)
  }

  const scriptContent = await response.text()

  const writeMatch = scriptContent.match(/document\.write\("(.+)"\);/s)
  if (!writeMatch) {
    throw new Error('No document.write found')
  }

  let htmlContent = writeMatch[1]

  htmlContent = htmlContent.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )

  htmlContent = htmlContent
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/\\n/g, '\n')

  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')

  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Failed to parse HTML')
  }

  const table = doc.querySelector('table.chroma')
  let language = 'text'

  const dataFilename = table?.getAttribute('data-filename')
  if (dataFilename) {
    language = dataFilename.split('.').pop()?.toLowerCase() || 'text'
  }

  const codeCells = doc.querySelectorAll('td.line-code')
  if (codeCells.length === 0) {
    throw new Error('No code found')
  }

  const codeLines = Array.from(codeCells).map((cell) => {
    return cell.textContent || ''
  })

  return {
    code: codeLines.join(''),
    language,
  }
}

export function OpenGistCode({ url }: OpenGistCodeProps) {
  const { data, error, isLoading } = useSWR(url, fetchGistCode, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const gistUrl = url.replace(/\.js$/, '')

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg bg-neutral-800 p-4">
        <div className="h-32 rounded bg-neutral-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
        <p className="font-semibold">Error loading code:</p>
        <p className="mt-1 text-sm">{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="group relative my-4">
      <a
        href={gistUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xm !hover:bg-neutral-800 absolute right-3 bottom-2 z-10 rounded px-1.5 py-1 !text-neutral-400 transition-colors"
        title="Open Gist"
      >
        <GoArrowUpRight className="stroke-1" />
      </a>
      <pre>
        <Code language={data.language}>{data.code}</Code>
      </pre>
    </div>
  )
}
