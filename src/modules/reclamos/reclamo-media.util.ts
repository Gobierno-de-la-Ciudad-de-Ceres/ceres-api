import fs from 'fs';
import path from 'path';
import { resolve } from 'path';

export type ReclamoImagePayload = {
  buffer: Buffer;
  extension: 'jpeg' | 'png';
};

function getMediaReclamosDirs(): string[] {
  const candidates = [
    process.env.MEDIA_RECLAMOS_PATH,
    resolve(process.cwd(), 'media', 'reclamos'),
    '/var/www/ceres-api/media/reclamos',
    '/root/ceres-api/media/reclamos',
    '/root/ceresito/src/media/reclamos',
    '/root/ceresito/base-ts-meta-postgres/src/media/reclamos',
  ].filter((value): value is string => Boolean(value));

  return [...new Set(candidates.map((dir) => path.resolve(dir)))];
}

function extractFileName(url: string): string | null {
  const normalized = url
    .trim()
    .replace('/api/media/reclamos/', '/media/reclamos/');
  const match = normalized.match(/\/media\/reclamos\/(file-\d+\.[a-z0-9]+)/i);
  return match?.[1] ?? null;
}

function extensionFromFileName(fileName: string): ReclamoImagePayload['extension'] {
  return fileName.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
}

function tryReadLocalImage(url: string): ReclamoImagePayload | null {
  const fileName = extractFileName(url);
  if (!fileName) return null;

  for (const dir of getMediaReclamosDirs()) {
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) continue;
    return {
      buffer: fs.readFileSync(filePath),
      extension: extensionFromFileName(fileName),
    };
  }

  return null;
}

async function tryFetchRemoteImage(url: string): Promise<ReclamoImagePayload | null> {
  const candidates = [url.trim()];
  const alt = url.replace('/media/reclamos/', '/api/media/reclamos/');
  if (alt !== url) candidates.push(alt);

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { cache: 'no-store' });
      if (!response.ok) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || '';
      return {
        buffer,
        extension: contentType.includes('png') ? 'png' : 'jpeg',
      };
    } catch {
      // probar siguiente URL
    }
  }

  return null;
}

export async function loadReclamoImage(
  url?: string | null,
): Promise<ReclamoImagePayload | null> {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'No') return null;

  return tryReadLocalImage(trimmed) ?? (await tryFetchRemoteImage(trimmed));
}

export function tryDeleteReclamoImageFile(url?: string | null): boolean {
  const fileName = url ? extractFileName(url) : null;
  if (!fileName) return false;

  let deleted = false;
  for (const dir of getMediaReclamosDirs()) {
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) continue;
    fs.unlinkSync(filePath);
    deleted = true;
  }

  return deleted;
}
