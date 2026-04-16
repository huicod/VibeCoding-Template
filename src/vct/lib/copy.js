'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readEntryPayload(entry) {
  if (Buffer.isBuffer(entry.content)) {
    return entry.content;
  }

  if (typeof entry.content === 'string') {
    return Buffer.from(entry.content, 'utf8');
  }

  return fs.readFile(entry.sourcePath);
}

async function writeEntry(destinationRoot, entry, options = {}) {
  const force = options.force === true;
  const skipIfUnchanged = options.skipIfUnchanged === true;
  const destinationPath = path.join(destinationRoot, entry.outputPath);

  if (!force && await pathExists(destinationPath)) {
    return { status: 'skipped', outputPath: entry.outputPath };
  }

  const payload = await readEntryPayload(entry);

  if (force && skipIfUnchanged && await pathExists(destinationPath)) {
    const existingPayload = await fs.readFile(destinationPath);
    if (Buffer.compare(existingPayload, payload) === 0) {
      return { status: 'unchanged', outputPath: entry.outputPath };
    }
  }

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });

  await fs.writeFile(destinationPath, payload);

  return { status: 'written', outputPath: entry.outputPath };
}

async function writeEntries(destinationRoot, entries, options = {}) {
  const written = [];
  const skipped = [];
  const unchanged = [];

  for (const entry of entries) {
    const result = await writeEntry(destinationRoot, entry, options);
    if (result.status === 'written') {
      written.push(result.outputPath);
    } else if (result.status === 'unchanged') {
      unchanged.push(result.outputPath);
    } else {
      skipped.push(result.outputPath);
    }
  }

  return { written, skipped, unchanged };
}

module.exports = {
  pathExists,
  readEntryPayload,
  writeEntries
};
