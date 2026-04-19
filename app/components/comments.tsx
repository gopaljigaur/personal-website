'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function Comments() {
  const { resolvedTheme } = useTheme()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const theme = !origin
    ? 'light'
    : resolvedTheme === 'dark'
      ? `${origin}/comments-dark.css`
      : `${origin}/comments.css`

  return (
    <div className="mt-20 mb-10">
      <Giscus
        key={theme}
        id="comments"
        repo="gopaljigaur/personal-website"
        repoId="R_kgDONy5ahw"
        category="Announcements"
        categoryId="DIC_kwDONy5ah84Cm4Re"
        mapping="title"
        strict="1"
        reactionsEnabled="0"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="en"
        loading="lazy"
      />
    </div>
  )
}
