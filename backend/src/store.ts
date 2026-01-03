import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Batch } from './types.js';

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'batches.json');

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, JSON.stringify({}), 'utf-8');
}

export function loadAll(): Record<string, Batch> {
  ensureStore();
  const raw = readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw || '{}');
}

export function saveAll(data: Record<string, Batch>) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getBatch(id: string): Batch | undefined {
  const all = loadAll();
  return all[id];
}

export function putBatch(batch: Batch) {
  const all = loadAll();
  all[batch.batchId] = batch;
  saveAll(all);
} 