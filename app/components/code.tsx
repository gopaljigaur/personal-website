'use client'

import { useState } from 'react'
import { highlight } from 'sugar-high'
import { GoCopy, GoCheck } from 'react-icons/go'

function Code({ children, ...props }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(children).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    let codeHTML = highlight(children)

    return (
        <div className="relative">
            <button
                onClick={handleCopy}
                className="absolute top-1 right-1 text-sm p-1 rounded cursor-pointer"
            >
                {copied ? <GoCheck /> : <GoCopy />}
            </button>
            <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
        </div>
    )
}

export default Code