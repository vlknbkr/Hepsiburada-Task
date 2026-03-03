import path from 'node:path';
import fs from 'node:fs';

export const resultsDir = path.resolve(process.cwd(), 'results');
export const screenshotsDir = path.resolve(resultsDir, 'screenshots');

export function ensureDirs() {
  fs.mkdirSync(resultsDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });
}