import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    alias: {
      app: path.resolve(__dirname, './app'),
      content: path.resolve(__dirname, './content'),
    },
  },
  resolve: {
    alias: {
      app: path.resolve(__dirname, './app'),
      content: path.resolve(__dirname, './content'),
    },
  },
})
