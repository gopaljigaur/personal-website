import { defineConfig } from 'tinacms'

export default defineConfig({
  branch: '',
  clientId: null,
  token: null,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'misc',
        label: 'Misc Links',
        path: 'content',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
        },
        match: { include: 'misc' },
        fields: [
          {
            type: 'object',
            name: 'links',
            label: 'Links',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title }) },
            fields: [
              {
                type: 'string',
                name: 'title',
                label: 'Title',
                isTitle: true,
                required: true,
              },
              { type: 'string', name: 'url', label: 'URL', required: true },
              {
                type: 'string',
                name: 'note',
                label: 'Note',
                ui: { component: 'textarea' },
              },
            ],
          },
        ],
      },
      {
        name: 'blog',
        label: 'Blog Posts',
        path: 'app/blog/posts',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'datetime',
            name: 'publishedAt',
            label: 'Published At',
            required: true,
          },
          {
            type: 'string',
            name: 'summary',
            label: 'Summary',
            required: true,
            ui: { component: 'textarea' },
          },
          {
            type: 'image',
            name: 'image',
            label: 'Cover Image',
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
    ],
  },
})
