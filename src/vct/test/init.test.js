'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { init } = require('../lib/init');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vct-init-'));
  try {
    await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

test('vct init projects antigravity files and shared scaffolding', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-antigravity');
    await init({
      destinationDir: outputDir,
      targetIds: ['antigravity']
    });

    assert.equal(await exists(path.join(outputDir, 'AGENTS.md')), true);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'docs', 'README.md')), true);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'artifacts', 'error_journal.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vct', 'install-lock.json')), true);
    assert.equal(await exists(path.join(outputDir, '.vscode', 'mcp.json')), true);

    assert.equal(await exists(path.join(outputDir, '.antigravity', 'docs', 'GUIDE.md')), false);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'artifacts', 'plan_template_review_fixes_20260408.md')), false);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'skills', 'git-forensics', 'scripts', '__pycache__')), false);
  });
});

test('vct init projects cursor claude and codex layouts from the same canonical source', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-multi-target');
    await init({
      destinationDir: outputDir,
      targetIds: ['cursor', 'claude', 'codex']
    });

    assert.equal(await exists(path.join(outputDir, '.cursor', 'commands', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.cursor', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.claude', 'commands', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.claude', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.codex', 'skills', 'vibecoding-system', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.codex', 'skills', 'vibecoding-system', 'references', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.codex', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'genesis', '.gitkeep')), true);

    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vct', 'install-lock.json'), 'utf8'));
    assert.deepEqual(lock.targets.map((target) => target.targetId), ['cursor', 'claude', 'codex']);
    assert.equal(await exists(path.join(outputDir, '.codex', 'skills', 'git-forensics', 'scripts', '__pycache__')), false);
  });
});
