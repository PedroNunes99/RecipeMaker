import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Logger utility
 */
export class Logger {
  constructor(context) {
    this.context = context;
  }

  log(message, ...args) {
    console.log(`[${new Date().toISOString()}] [${this.context}] ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`[${new Date().toISOString()}] [${this.context}] ERROR: ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`[${new Date().toISOString()}] [${this.context}] WARN: ${message}`, ...args);
  }

  info(message, ...args) {
    console.info(`[${new Date().toISOString()}] [${this.context}] INFO: ${message}`, ...args);
  }

  debug(message, ...args) {
    if (process.env.DEBUG) {
      console.debug(`[${new Date().toISOString()}] [${this.context}] DEBUG: ${message}`, ...args);
    }
  }
}

/**
 * Read file content
 */
export async function readFile(filePath) {
  const fullPath = path.resolve(PROJECT_ROOT, filePath);
  return await fs.readFile(fullPath, 'utf-8');
}

/**
 * Write file content
 */
export async function writeFile(filePath, content) {
  const fullPath = path.resolve(PROJECT_ROOT, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
}

/**
 * Check if file exists
 */
export async function fileExists(filePath) {
  try {
    const fullPath = path.resolve(PROJECT_ROOT, filePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute shell command
 */
export async function execCommand(command, cwd = PROJECT_ROOT) {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execPromise = promisify(exec);

  return await execPromise(command, { cwd });
}

/**
 * Generate unique task ID
 */
export function generateTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load JSON configuration
 */
export async function loadConfig(configPath) {
  const content = await readFile(configPath);
  return JSON.parse(content);
}

/**
 * Save JSON configuration
 */
export async function saveConfig(configPath, data) {
  const content = JSON.stringify(data, null, 2);
  await writeFile(configPath, content);
}

/**
 * Format error for logging
 */
export function formatError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  return { message: String(error) };
}

/**
 * Retry utility
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delay * attempt);
      }
    }
  }

  throw lastError;
}

/**
 * Get files matching pattern
 */
export async function glob(pattern, basePath = PROJECT_ROOT) {
  const { glob: globModule } = await import('glob');
  return await globModule(pattern, { cwd: basePath });
}
