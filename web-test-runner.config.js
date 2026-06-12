import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: ['tests/browser/**/*.test.js'],
  nodeResolve: true,
  concurrency: 1,
  browsers: [
    playwrightLauncher({ product: 'chromium', launchOptions: { headless: true } }),
  ],
};
