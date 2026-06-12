/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const BANNER = `/*!
 * @humza/feature-cards/react — React wrapper
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */`;

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/react/index.tsx'),
      name: 'FeatureCardsReact',
      formats: ['es'],
      fileName: () => 'react.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', '../feature-cards.js'],
      output: {
        banner: BANNER,
        paths: {
          '../feature-cards.js': './feature-cards.js',
        },
      },
    },
  },
});
