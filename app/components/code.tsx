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
        <div className="relative p-1 pr-6 pl-2">
            <button
                onClick={handleCopy}
                className="absolute top-0 right-0 text-m p-1.5 rounded cursor-pointer text-neutral-400 hover:bg-neutral-800"
            >
                {copied ? <GoCheck className="text-green-600 stroke-1" /> : <GoCopy className="stroke-1"/>}
            </button>
            <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
        </div>
    )
}

export default Code