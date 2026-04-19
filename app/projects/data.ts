export type Project = {
  title: string
  summary: string
  image?: string
  techStack?: string[]
  links?: { label: string; href: string }[]
}

export const projects: Project[] = [
  {
    title: 'Cyclops',
    summary:
      'Lightweight AI agent framework with MCP toolkit support, LiteLLM integration, and an extensible tool registry with memory management.',
    techStack: ['python', 'ai agents', 'llm'],
    links: [
      { label: 'GitHub', href: 'https://github.com/gopaljigaur/cyclops' },
    ],
  },
  {
    title: 'Twitter Network Analysis',
    summary:
      'Interactive dashboard for exploring Twitter graph data in Neo4j, with semantic search and natural language queries powered by Google Gemini.',
    techStack: ['typescript', 'machine learning'],
    links: [
      { label: 'GitHub', href: 'https://github.com/gopaljigaur/twitter-neo4j' },
      { label: 'Live', href: 'https://neo4j.gopalji.me' },
    ],
  },
  {
    title: 'StorySync',
    summary:
      'Training-free method for subject consistency in text-to-image generation via region harmonization.',
    techStack: ['python', 'machine learning', 'diffusion models', 'pytorch'],
    links: [
      { label: 'GitHub', href: 'https://github.com/gopaljigaur/storysync' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2508.03735' },
    ],
  },
  {
    title: 'Task Detection with ViT',
    summary:
      'Uses a Vision Transformer (DINO ViT) to detect robot manipulation tasks independent of the environment, tested in the ManiSkill2 simulator.',
    techStack: ['python', 'machine learning', 'computer vision', 'pytorch'],
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/gopaljigaur/task-detection-project',
      },
    ],
  },
]
