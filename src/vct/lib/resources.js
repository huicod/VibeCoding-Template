'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..', '..', '..');
const COMMON_ROOT = '.vibe';
const ROOT_AGENTS_FILE = path.join(REPO_ROOT, 'AGENTS.md');
const CANONICAL_WORKFLOWS_ROOT = path.join(REPO_ROOT, '.antigravity', 'workflows');
const CANONICAL_SKILLS_ROOT = path.join(REPO_ROOT, '.antigravity', 'skills');
const CANONICAL_SCRIPTS_ROOT = path.join(REPO_ROOT, '.antigravity', 'scripts');
const TEMPLATE_ROOT = path.join(__dirname, '..', 'templates');
const SCAFFOLD_ROOT = path.join(TEMPLATE_ROOT, 'scaffold');
const ROUTER_SKILL_TEMPLATE = path.join(TEMPLATE_ROOT, 'skills', 'vibecoding-system', 'SKILL.md');
const SHARED_RESOURCES = [
  {
    sourcePath: path.join(REPO_ROOT, '.vscode', 'mcp.json'),
    outputPath: '.vscode/mcp.json'
  }
];

function toPosix(relPath) {
  return relPath.split(path.sep).join('/');
}

function rewriteGeneratedText(content) {
  return [
    [/.antigravity\/scripts\/git_forensics\.py/g, '.vibe/skills/git-forensics/scripts/git_forensics.py'],
    [/.antigravity\/scripts\/git_hotspots\.py/g, '.vibe/skills/git-forensics/scripts/git_hotspots.py'],
    [/.antigravity\/scripts\//g, '.vibe/scripts/'],
    [/.antigravity\//g, '.vibe/'],
    [/.antigravity\b/g, '.vibe'],
    [/.vct\//g, '.vibe/'],
    [/.vct\b/g, '.vibe']
  ].reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), content);
}

function shouldIgnoreFile(relPath) {
  const normalized = toPosix(relPath);
  const segments = normalized.split('/');

  if (segments.includes('__pycache__')) {
    return true;
  }

  return (
    normalized.endsWith('.pyc') ||
    normalized.endsWith('.pyo') ||
    normalized.endsWith('.DS_Store') ||
    normalized.endsWith('Thumbs.db')
  );
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(rootPath, filter) {
  if (!await pathExists(rootPath)) {
    return [];
  }

  const files = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry.name);
      const relPath = toPosix(path.relative(rootPath, absolutePath));

      if (shouldIgnoreFile(relPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (filter && !filter(relPath)) {
        continue;
      }

      files.push({
        relPath,
        sourcePath: absolutePath
      });
    }
  }

  await walk(rootPath);
  return files.sort((left, right) => left.relPath.localeCompare(right.relPath));
}

async function listCanonicalWorkflows() {
  return listFilesRecursive(CANONICAL_WORKFLOWS_ROOT, (relPath) => relPath.endsWith('.md'));
}

async function listCanonicalSkills() {
  return listFilesRecursive(CANONICAL_SKILLS_ROOT);
}

async function listCanonicalSkillEntrypoints() {
  return listCanonicalSkills().then((files) => files.filter((file) => file.relPath.endsWith('/SKILL.md')));
}

async function listCanonicalScripts() {
  return listFilesRecursive(CANONICAL_SCRIPTS_ROOT);
}

async function listScaffoldFiles() {
  return listFilesRecursive(SCAFFOLD_ROOT).then((files) => files.map((file) => ({
    ...file,
    outputPath: file.relPath.replace(/^\.antigravity/, COMMON_ROOT)
  })));
}

async function listSharedFiles() {
  const existing = [];

  for (const resource of SHARED_RESOURCES) {
    if (await pathExists(resource.sourcePath)) {
      existing.push(resource);
    }
  }

  return existing;
}

module.exports = {
  COMMON_ROOT,
  CANONICAL_SKILLS_ROOT,
  CANONICAL_SCRIPTS_ROOT,
  CANONICAL_WORKFLOWS_ROOT,
  REPO_ROOT,
  ROOT_AGENTS_FILE,
  ROUTER_SKILL_TEMPLATE,
  SCAFFOLD_ROOT,
  listCanonicalScripts,
  listCanonicalSkillEntrypoints,
  listCanonicalSkills,
  listCanonicalWorkflows,
  listScaffoldFiles,
  listSharedFiles,
  rewriteGeneratedText
};
