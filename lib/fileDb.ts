/**
 * lib/fileDb.ts
 *
 * Simple JSON file-based data store. Each collection is a separate JSON file
 * in the `data/` directory at the project root. IDs are random hex strings.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readAll<T>(collection: string): T[] {
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T[];
  } catch {
    return [];
  }
}

function writeAll<T>(collection: string, data: T[]): void {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2), 'utf-8');
}

function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Generic CRUD ──────────────────────────────────────────────────────────────

export function findAll<T extends { _id: string }>(collection: string): T[] {
  return readAll<T>(collection);
}

export function findOne<T extends { _id: string }>(
  collection: string,
  predicate: (item: T) => boolean
): T | null {
  return readAll<T>(collection).find(predicate) ?? null;
}

export function findById<T extends { _id: string }>(
  collection: string,
  id: string
): T | null {
  return findOne<T>(collection, (item) => item._id === id);
}

export function insertOne<T extends Record<string, unknown>>(
  collection: string,
  data: T
): T & { _id: string; createdAt: string } {
  const all = readAll<T & { _id: string; createdAt: string }>(collection);
  const record = { ...data, _id: newId(), createdAt: new Date().toISOString() } as T & { _id: string; createdAt: string };
  all.push(record);
  writeAll(collection, all);
  return record;
}

export function upsertOne<T extends { _id: string }>(
  collection: string,
  predicate: (item: T) => boolean,
  data: Partial<T> & Record<string, unknown>
): T {
  const all = readAll<T>(collection);
  const idx = all.findIndex(predicate);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() } as T;
    writeAll(collection, all);
    return all[idx];
  } else {
    const record = { ...data, _id: newId(), updatedAt: new Date().toISOString() } as unknown as T;
    all.push(record);
    writeAll(collection, all);
    return record;
  }
}

export function updateOne<T extends { _id: string }>(
  collection: string,
  id: string,
  data: Partial<T>
): T | null {
  const all = readAll<T>(collection);
  const idx = all.findIndex((item) => item._id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...data };
  writeAll(collection, all);
  return all[idx];
}
