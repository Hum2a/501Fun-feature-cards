/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { resolve } from 'node:path';
import { defineConfig, type PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

const BANNER = `/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 * https://github.com/humza/feature-cards
 *
 * Licensed under the GNU Affero General Public License v3.0 only.
 * Commercial/network use requires source disclosure under the AGPL.
 */`;

export default defineConfig(({ mode }) => ({
  plugins:
    mode === 'analyze'
      ? ([
          visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        ] as PluginOption[])
      : [],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FeatureCards',
      formats: ['es', 'iife'],
      fileName: (format) =>
        format === 'iife' ? 'feature-cards.iife.js' : 'feature-cards.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        banner: BANNER,
      },
    },
  },
}));
