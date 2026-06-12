/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname), '');
  const port = Number.parseInt(env.VITE_DEV_PORT ?? '5173', 10);

  return {
    root: resolve(__dirname, 'demo'),
    envDir: resolve(__dirname),
    resolve: {
      alias: {
        '@src': resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist/demo'),
      emptyOutDir: true,
    },
    server: {
      port: Number.isNaN(port) ? 5173 : port,
      open: false,
    },
    preview: {
      port: Number.isNaN(port) ? 4173 : port + 1000,
    },
  };
});
