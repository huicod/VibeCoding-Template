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

async function writeEntry(destinationRoot, entry, force) {
  const destinationPath = path.join(destinationRoot, entry.outputPath);

  if (!force && await pathExists(destinationPath)) {
    return { status: 'skipped', outputPath: entry.outputPath };
  }

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });

  if (typeof entry.content === 'string') {
    await fs.writeFile(destinationPath, entry.content, 'utf8');
  } else {
    await fs.copyFile(entry.sourcePath, destinationPath);
  }

  return { status: 'written', outputPath: entry.outputPath };
}

async function writeEntries(destinationRoot, entries, options = {}) {
  const force = options.force === true;
  const written = [];
  const skipped = [];

  for (const entry of entries) {
    const result = await writeEntry(destinationRoot, entry, force);
    if (result.status === 'written') {
      written.push(result.outputPath);
    } else {
      skipped.push(result.outputPath);
    }
  }

  return { written, skipped };
}

module.exports = {
  pathExists,
  writeEntries
};
