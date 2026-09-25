import { spawn } from 'node:child_process';
import { FlyaiError } from '../errors/errors.js';
import { parseFlyaiOutput } from './parser.js';

const MAX_OUTPUT_BYTES = 8 * 1024 * 1024;

export async function runFlyai(command: string, flags: string[], options: {
  bin?: string;
  timeoutMs?: number;
} = {}): Promise<Record<string, unknown>> {
  const bin = options.bin ?? process.env.FLYAI_BIN ?? 'flyai';
  const timeoutMs = options.timeoutMs ?? Number(process.env.FLYAI_TIMEOUT_MS ?? 30000);
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 300000) {
    throw new FlyaiError('CONFIG_ERROR', 'FLYAI_TIMEOUT_MS must be between 1 and 300000');
  }
  return new Promise((resolve, reject) => {
    const child = spawn(bin, [command, ...flags], {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });
    const chunks: Buffer[] = [];
    let size = 0;
    let timedOut = false;
    let tooLarge = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    child.stdout.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_OUTPUT_BYTES) {
        tooLarge = true;
        child.kill('SIGKILL');
      } else {
        chunks.push(chunk);
      }
    });
    // Drain stderr without logging potentially sensitive upstream content.
    child.stderr.resume();
    child.on('error', () => {
      clearTimeout(timer);
      reject(new FlyaiError('SPAWN_FAILED', 'FlyAI CLI could not be started'));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) return reject(new FlyaiError('TIMEOUT', 'FlyAI search timed out'));
      if (tooLarge) return reject(new FlyaiError('OUTPUT_LIMIT', 'FlyAI result exceeded the size limit'));
      if (code !== 0) return reject(new FlyaiError('CLI_FAILED', 'FlyAI search failed'));
      try {
        resolve(parseFlyaiOutput(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
  });
}
