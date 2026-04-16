import 'react'

declare module 'react' {
  export const ViewTransition: React.FC<{
    children: React.ReactNode
    name?: string
  }>
}
