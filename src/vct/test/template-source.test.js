'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {
  ROOT_AGENTS_FILE,
  CANONICAL_SCRIPTS_ROOT,
  CANONICAL_SKILLS_ROOT,
  CANONICAL_WORKFLOWS_ROOT,
  SCAFFOLD_ROOT,
  rewriteGeneratedText
} = require('../lib/resources');

async function collectFiles(targetPath) {
  const stat = await fs.stat(targetPath);

  if (stat.isFile()) {
    return [targetPath];
  }

  const files = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        files.push(absolutePath);
      }
    }
  }

  await walk(targetPath);
  return files.sort();
}

test('canonical template sources are already self-consistent without runtime path rewriting', async () => {
  const targets = [
    ROOT_AGENTS_FILE,
    CANONICAL_WORKFLOWS_ROOT,
    CANONICAL_SKILLS_ROOT,
    CANONICAL_SCRIPTS_ROOT,
    path.join(SCAFFOLD_ROOT, '.vibe')
  ];

  const files = [];

  for (const target of targets) {
    files.push(...await collectFiles(target));
  }

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    assert.equal(
      rewriteGeneratedText(content),
      content,
      `template source still needs runtime rewriting: ${path.relative(path.join(__dirname, '..'), filePath)}`
    );
  }
});

test('template consistency script validates shared workflows and skills under .agents', async () => {
  const scriptPath = path.join(CANONICAL_SCRIPTS_ROOT, 'check-template-consistency.sh');
  const script = await fs.readFile(scriptPath, 'utf8');

  assert.match(script, /\.agents\/workflows/);
  assert.match(script, /\.agents\/skills/);
  assert.doesNotMatch(script, /\.vibe\/workflows/);
  assert.doesNotMatch(script, /\.vibe\/skills/);
  assert.doesNotMatch(script, /\.antigravity\/workflows/);
  assert.doesNotMatch(script, /\.antigravity\/skills/);
});
