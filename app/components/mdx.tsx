import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'
import { Code, GistCode } from 'app/components/code'
import { VibeSimulator } from 'app/components/vibe-simulator'
import { Callout } from 'app/components/callout'
import { PostPreviewLink } from 'app/components/post-preview-link'
import { LinkPreview } from 'app/components/link-preview'
import { slugify } from 'app/blog/utils.shared'
import { getBlogPosts } from 'app/blog/utils'

function Table({ data }) {
  const headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  const rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  const href = props?.href || ''

  const blogMatch = href.match(/^\/blog\/([^/]+)$/)
  if (blogMatch) {
    const slug = blogMatch[1]
    const post = getBlogPosts().find((p) => p.slug === slug)
    if (post) {
      return (
        <PostPreviewLink
          href={href}
          post={{
            title: post.metadata.title,
            publishedAt: post.metadata.publishedAt,
            image: post.metadata.image,
            tags: post.metadata.tags,
          }}
        >
          {props.children}
        </PostPreviewLink>
      )
    }
  }

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    // eslint-disable-next-line  jsx-a11y/anchor-has-content
    return <a {...props} />
  }

  if (href.startsWith('http')) {
    return <LinkPreview href={href}>{props.children}</LinkPreview>
  }

  // eslint-disable-next-line  jsx-a11y/anchor-has-content
  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

function createHeading(level) {
  const Heading = ({ children }) => {
    const slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children,
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  table: Table,
  VibeSimulator,
  Callout,
  GistCode,
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
