import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '@nexio/design-system': '../../packages/design-system/src',
      '@nexio/offline': '../../packages/offline/src',
      '@nexio/shared-tokens': '../../packages/shared-tokens/src'
    }
  }
});
