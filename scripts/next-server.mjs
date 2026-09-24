#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2];

if (mode !== 'dev' && mode !== 'start') {
  console.error('Usage: node scripts/next-server.mjs <dev|start>');
  process.exit(1);
}

loadEnvConfig(root, mode === 'dev');

const port = process.env.PORT ?? '3007';
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const args =
  mode === 'dev'
    ? ['dev', '-H', '0.0.0.0', '-p', port]
    : ['start', '-p', port];

const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
