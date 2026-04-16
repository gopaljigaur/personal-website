export type Project = {
  title: string
  summary: string
  image?: string
  techStack?: string[]
  links?: {
    github?: string
    live?: string
  }
}

export const projects: Project[] = [
  {
    title: 'LLM + RAG Chatbot',
    summary:
      'A chatbot that answers questions from uploaded documents using retrieval-augmented generation.',
    techStack: ['Python', 'LangChain', 'FAISS', 'OpenAI'],
    links: {
      github: 'https://github.com/gopaljigaur',
    },
  },
]
