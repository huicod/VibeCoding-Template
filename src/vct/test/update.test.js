'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { init } = require('../lib/init');
const { update } = require('../lib/update');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vct-update-'));
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

test('vct update refreshes managed .agents files while preserving project-owned .vibe scaffolding', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-update');

    await init({
      destinationDir: outputDir,
      targetIds: ['antigravity', 'cursor']
    });

    await fs.writeFile(path.join(outputDir, '.vibe', 'docs', 'README.md'), 'project architecture docs\n', 'utf8');
    await fs.writeFile(path.join(outputDir, '.agents', 'workflows', 'genesis.md'), 'stale workflow\n', 'utf8');
    await fs.writeFile(path.join(outputDir, '.cursor', 'commands', 'genesis.md'), 'stale wrapper\n', 'utf8');

    await update({
      destinationDir: outputDir
    });

    const docsReadme = await fs.readFile(path.join(outputDir, '.vibe', 'docs', 'README.md'), 'utf8');
    const workflow = await fs.readFile(path.join(outputDir, '.agents', 'workflows', 'genesis.md'), 'utf8');
    const wrapper = await fs.readFile(path.join(outputDir, '.cursor', 'commands', 'genesis.md'), 'utf8');
    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vibe', 'install-lock.json'), 'utf8'));

    assert.equal(docsReadme, 'project architecture docs\n');
    assert.notEqual(workflow, 'stale workflow\n');
    assert.notEqual(wrapper, 'stale wrapper\n');
    assert.match(wrapper, /\.agents\/workflows\/genesis\.md/);
    assert.deepEqual(lock.lastUpdateSummary.failedTargets, []);
    assert.deepEqual(lock.lastUpdateSummary.successfulTargets, ['antigravity', 'cursor']);
    assert.equal(lock.targets.find((target) => target.targetId === 'cursor').lastSuccessfulUpdate.version, lock.cliVersion);
  });
});

test('vct update falls back to directory scan when install-lock is missing and rebuilds it', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-scan-fallback');

    await init({
      destinationDir: outputDir,
      targetIds: ['cursor', 'codex']
    });

    await fs.rm(path.join(outputDir, '.vibe', 'install-lock.json'), { force: true });

    await update({
      destinationDir: outputDir
    });

    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vibe', 'install-lock.json'), 'utf8'));

    assert.deepEqual(lock.targets.map((target) => target.targetId), ['codex', 'cursor']);
    assert.equal(lock.shared.bootstrapFiles.includes('.vibe/docs/README.md'), true);
    assert.equal(lock.lastUpdateSummary.successfulTargets.includes('codex'), true);
    assert.equal(lock.lastUpdateSummary.successfulTargets.includes('cursor'), true);
  });
});

test('vct update records partial target failures without dropping successful targets from install-lock', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-partial-update');

    await init({
      destinationDir: outputDir,
      targetIds: ['cursor', 'codex']
    });

    await fs.rm(path.join(outputDir, '.cursor', 'skills', 'spec-writer'), { recursive: true, force: true });
    await fs.writeFile(path.join(outputDir, '.cursor', 'skills', 'spec-writer'), 'conflict', 'utf8');
    await fs.writeFile(path.join(outputDir, '.codex', 'skills', 'vibecoding-system', 'SKILL.md'), 'stale router\n', 'utf8');

    await update({
      destinationDir: outputDir
    });

    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vibe', 'install-lock.json'), 'utf8'));
    const codexRouter = await fs.readFile(path.join(outputDir, '.codex', 'skills', 'vibecoding-system', 'SKILL.md'), 'utf8');

    assert.equal(lock.lastUpdateSummary.failedTargets.includes('cursor'), true);
    assert.equal(lock.lastUpdateSummary.successfulTargets.includes('codex'), true);
    assert.equal(lock.targets.some((target) => target.targetId === 'cursor'), true);
    assert.equal(lock.targets.some((target) => target.targetId === 'codex'), true);
    assert.notEqual(codexRouter, 'stale router\n');
    assert.equal(await exists(path.join(outputDir, '.cursor', 'skills', 'spec-writer', 'SKILL.md')), false);
  });
});

test('vct update refuses to operate on a foreign target layout without a managed .vibe root', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'foreign-update-target');

    await fs.mkdir(path.join(outputDir, '.antigravity', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(outputDir, '.antigravity', 'workflows', 'existing.md'), 'foreign workflow\n', 'utf8');

    await assert.rejects(
      update({
        destinationDir: outputDir
      }),
      /No managed \.vibe workspace found/
    );
  });
});
