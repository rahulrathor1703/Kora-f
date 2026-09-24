#!/usr/bin/env node
import { execSync } from 'node:child_process';

function run(command) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

let outdatedJson = '{}';

try {
  outdatedJson = run('npm outdated --json');
} catch (error) {
  if (
    error &&
    typeof error === 'object' &&
    'stdout' in error &&
    typeof error.stdout === 'string'
  ) {
    outdatedJson = error.stdout.trim() || '{}';
  } else {
    console.error('Failed to check outdated packages.');
    process.exit(1);
  }
}

/** @type {Record<string, { current?: string; wanted?: string; latest?: string }>} */
const outdated = JSON.parse(outdatedJson || '{}');
const semverDrift = Object.entries(outdated).filter(
  ([, info]) => info.current !== info.wanted,
);

if (semverDrift.length > 0) {
  console.error('Outdated packages detected (must match semver "wanted" version):');
  for (const [name, info] of semverDrift) {
    console.error(`  ${name}: ${info.current} -> ${info.wanted}`);
  }
  process.exit(1);
}

console.log('All dependencies are up to date within their semver ranges.');
