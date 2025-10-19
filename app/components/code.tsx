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

interface GistFile {
  filename: string
  content: string
  type: string
}

interface GistData {
  files: GistFile[]
}

export function Code({ children, ...props }) {
  const [copied, setCopied] = useState(false)
  const [element, setElement] = useState(null)

  const language =
    props.language || props.className?.replace('language-', '') || 'javascript'

  useEffect(() => {
    const highlight = async () => {
      const hast = await codeToHast(children, {
        lang: language,
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
  }, [children, language])

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
        className="absolute top-0 right-0 z-10 cursor-pointer rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800"
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

const fetchGistCode = async (url: string) => {
  // Parse URL to get the hash fragment (e.g., #file-test-py)
  const urlParts = url.split('#')
  const baseUrl = urlParts[0]
  const fileHash = urlParts[1] // e.g., "file-test-py"

  // Fetch the JSON (base URL + .json)
  const jsonUrl = `${baseUrl}.json`

  const response = await fetch(jsonUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`)
  }

  const data: GistData = await response.json()

  if (fileHash) {
    // Find specific file by hash
    const file = data.files.find((f) => {
      const slug = 'file-' + f.filename.toLowerCase().replace(/\./g, '-')
      return slug === fileHash.toLowerCase()
    })

    if (!file) {
      throw new Error(`File not found: ${fileHash}`)
    }

    return {
      files: [file],
      allFiles: false,
    }
  } else {
    // No hash specified, return all files
    return {
      files: data.files,
      allFiles: true,
    }
  }
}

export function OpenGistCode({ url }: OpenGistCodeProps) {
  const { data, error, isLoading } = useSWR(url, fetchGistCode, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const gistUrl = url

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
    <div className="my-4 space-y-4">
      {data.files.map((file, index) => (
        <div key={index} className="group relative overflow-hidden rounded-lg">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-neutral-700 bg-neutral-800/50 px-4 py-2">
            <span className="text-sm text-neutral-400">{file.filename}</span>
            <a
              href={
                data.allFiles
                  ? `${gistUrl}#file-${file.filename.toLowerCase().replace(/\./g, '-')}`
                  : gistUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs !text-neutral-500 transition-colors hover:!text-neutral-400"
              title="Open Gist"
            >
              open gist
              <GoArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          {/* Code block */}
          <pre className="!m-0 !rounded-none">
            <Code language={file.type.toLowerCase()}>{file.content}</Code>
          </pre>
        </div>
      ))}
    </div>
  )
}
