'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { init } = require('../lib/init');

const { version } = require(path.join(__dirname, '..', '..', '..', 'package.json'));

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

test('vct init projects shared core into .vibe and antigravity wrappers separately', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-antigravity');
    await init({
      destinationDir: outputDir,
      targetIds: ['antigravity']
    });

    assert.equal(await exists(path.join(outputDir, 'AGENTS.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'docs', 'README.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'artifacts', 'error_journal.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'install-lock.json')), true);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vscode', 'mcp.json')), true);

    assert.equal(await exists(path.join(outputDir, '.antigravity', 'docs', 'README.md')), false);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'artifacts', 'error_journal.md')), false);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'docs', 'GUIDE.md')), false);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'artifacts', 'plan_template_review_fixes_20260408.md')), false);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'skills', 'git-forensics', 'scripts', '__pycache__')), false);
    assert.equal(await exists(path.join(outputDir, '.antigravity', 'skills', 'spec-writer', 'references', 'prd_template.md')), false);

    const agents = await fs.readFile(path.join(outputDir, 'AGENTS.md'), 'utf8');
    const antigravityWorkflowWrapper = await fs.readFile(path.join(outputDir, '.antigravity', 'workflows', 'genesis.md'), 'utf8');
    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vibe', 'install-lock.json'), 'utf8'));

    assert.match(agents, /\.vibe\//);
    assert.doesNotMatch(agents, /\.antigravity\//);
    assert.match(antigravityWorkflowWrapper, /\.vibe\/workflows\/genesis\.md/);
    assert.equal(lock.schemaVersion, 2);
    assert.equal(lock.sharedRoot, '.vibe');
    assert.equal(lock.shared.managedFiles.includes('AGENTS.md'), true);
    assert.equal(lock.shared.bootstrapFiles.includes('.vibe/docs/README.md'), true);
    assert.equal(lock.targets[0].installedVersion, version);
  });
});

test('vct init projects cursor claude and codex as thin compatibility layers over .vibe', async () => {
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
    assert.equal(await exists(path.join(outputDir, '.codex', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'genesis', '.gitkeep')), true);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.vibe', 'skills', 'spec-writer', 'SKILL.md')), true);

    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vibe', 'install-lock.json'), 'utf8'));
    const cursorWorkflowWrapper = await fs.readFile(path.join(outputDir, '.cursor', 'commands', 'genesis.md'), 'utf8');
    const cursorSkillWrapper = await fs.readFile(path.join(outputDir, '.cursor', 'skills', 'spec-writer', 'SKILL.md'), 'utf8');
    const codexRouter = await fs.readFile(path.join(outputDir, '.codex', 'skills', 'vibecoding-system', 'SKILL.md'), 'utf8');

    assert.deepEqual(lock.targets.map((target) => target.targetId), ['claude', 'codex', 'cursor']);
    assert.equal(lock.sharedRoot, '.vibe');
    assert.equal(await exists(path.join(outputDir, '.codex', 'skills', 'git-forensics', 'scripts', '__pycache__')), false);
    assert.equal(await exists(path.join(outputDir, '.cursor', 'skills', 'spec-writer', 'references', 'prd_template.md')), false);
    assert.equal(await exists(path.join(outputDir, '.codex', 'skills', 'vibecoding-system', 'references', 'genesis.md')), false);

    assert.match(cursorWorkflowWrapper, /\.vibe\/workflows\/genesis\.md/);
    assert.match(cursorSkillWrapper, /\.vibe\/skills\/spec-writer\/SKILL\.md/);
    assert.match(codexRouter, /\.vibe\/workflows\/quickstart\.md/);
  });
});

test('vct init projects the extended target matrix layouts', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-extended-targets');
    await init({
      destinationDir: outputDir,
      targetIds: ['windsurf', 'copilot', 'trae', 'qoder', 'kilo', 'opencode']
    });

    assert.equal(await exists(path.join(outputDir, '.windsurf', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.github', 'prompts', 'genesis.prompt.md')), true);
    assert.equal(await exists(path.join(outputDir, '.trae', 'skills', 'vibecoding-system', 'SKILL.md')), true);
    assert.equal(await exists(path.join(outputDir, '.qoder', 'commands', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.kilocode', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.opencode', 'commands', 'genesis.md')), true);

    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vibe', 'install-lock.json'), 'utf8'));
    assert.deepEqual(lock.targets.map((target) => target.targetId), ['copilot', 'kilo', 'opencode', 'qoder', 'trae', 'windsurf']);
  });
});

test('vct init preserves scanned targets in install-lock when adding a new target without an existing lock', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-add-target');

    await init({
      destinationDir: outputDir,
      targetIds: ['antigravity']
    });

    await fs.rm(path.join(outputDir, '.vibe', 'install-lock.json'), { force: true });

    await init({
      destinationDir: outputDir,
      targetIds: ['cursor']
    });

    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vibe', 'install-lock.json'), 'utf8'));
    assert.deepEqual(lock.targets.map((target) => target.targetId), ['antigravity', 'cursor']);
  });
});

test('vct init reports partial success and only records successful targets into install-lock', async () => {
  await withTempDir(async (tempDir) => {
    const outputDir = path.join(tempDir, 'generated-partial-init');

    await init({
      destinationDir: outputDir,
      targetIds: ['antigravity']
    });

    await fs.writeFile(path.join(outputDir, '.cursor'), 'conflict', 'utf8');

    await init({
      destinationDir: outputDir,
      targetIds: ['cursor', 'claude']
    });

    const lock = JSON.parse(await fs.readFile(path.join(outputDir, '.vibe', 'install-lock.json'), 'utf8'));
    assert.deepEqual(lock.targets.map((target) => target.targetId), ['antigravity', 'claude']);
    assert.deepEqual(lock.lastUpdateSummary.failedTargets, ['cursor']);
    assert.equal(await exists(path.join(outputDir, '.claude', 'commands', 'genesis.md')), true);
    assert.equal(await exists(path.join(outputDir, '.cursor', 'commands', 'genesis.md')), false);
  });
});
