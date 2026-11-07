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
      // 1. Home (Profile)
      {
        name: 'profile',
        label: 'Profile',
        path: 'content',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/',
        },
        match: { include: 'profile' },
        fields: [
          {
            type: 'string',
            name: 'name',
            label: 'Name',
            isTitle: true,
            required: true,
          },
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'location', label: 'Location' },
          { type: 'string', name: 'role', label: 'Role' },
          { type: 'string', name: 'workplace', label: 'Workplace' },
          { type: 'string', name: 'workplaceUrl', label: 'Workplace URL' },
          {
            type: 'string',
            name: 'bio',
            label: 'Bio',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'siteDescription',
            label: 'Description',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'ogTitle',
            label: 'OG: Title',
          },
          {
            type: 'string',
            name: 'ogDescription',
            label: 'OG: Description',
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'email', label: 'Email' },
          { type: 'string', name: 'github', label: 'GitHub URL' },
          { type: 'string', name: 'linkedin', label: 'LinkedIn URL' },
          { type: 'string', name: 'resume', label: 'Resume URL' },
        ],
      },
      // 2. Blog
      {
        name: 'blog',
        label: 'Blog Posts',
        path: 'app/blog/posts',
        format: 'mdx',
        ui: {
          router: ({ document }) => `/blog/${document._sys.filename}`,
        },
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
          { type: 'image', name: 'image', label: 'Cover Image' },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
            templates: [
              {
                name: 'VibeSimulator',
                label: 'Vibe Simulator',
                fields: [
                  { type: 'string', name: 'placeholder', label: 'Placeholder' },
                ],
              },
              {
                name: 'Callout',
                label: 'Callout',
                fields: [
                  {
                    type: 'string',
                    name: 'type',
                    label: 'Type',
                    options: ['note', 'warning', 'tip'],
                  },
                  {
                    type: 'string',
                    name: 'content',
                    label: 'Content',
                    ui: { component: 'textarea' },
                  },
                ],
              },
              {
                name: 'GistCode',
                label: 'GitHub Gist',
                fields: [
                  {
                    type: 'string',
                    name: 'url',
                    label: 'Gist URL',
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      // 3. Projects
      {
        name: 'projects',
        label: 'Projects',
        path: 'content',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/projects',
        },
        match: { include: 'projects' },
        fields: [
          {
            type: 'object',
            name: 'projects',
            label: 'Projects',
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
              {
                type: 'string',
                name: 'summary',
                label: 'Summary',
                required: true,
                ui: { component: 'textarea' },
              },
              { type: 'image', name: 'image', label: 'Image' },
              {
                type: 'string',
                name: 'techStack',
                label: 'Tech Stack',
                list: true,
              },
              {
                type: 'object',
                name: 'links',
                label: 'Links',
                list: true,
                ui: { itemProps: (item) => ({ label: item?.label }) },
                fields: [
                  {
                    type: 'string',
                    name: 'label',
                    label: 'Label',
                    required: true,
                  },
                  {
                    type: 'string',
                    name: 'href',
                    label: 'URL',
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      // 4. Misc
      {
        name: 'misc',
        label: 'Misc Links',
        path: 'content',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/misc',
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
    ],
  },
})
