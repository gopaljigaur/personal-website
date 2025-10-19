'use client'

import Giscus from '@giscus/react'
import { useState, useEffect } from 'react'

export default function Comments() {
  const [currentDomain, setCurrentDomain] = useState('')
  useEffect(() => {
    setCurrentDomain(window.location.origin)
  }, [])
  return (
    <div className="mt-20 mb-10">
      <Giscus
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
        theme={`${currentDomain}/comments.css`}
        lang="en"
        loading="lazy"
      />
    </div>
  )
}
