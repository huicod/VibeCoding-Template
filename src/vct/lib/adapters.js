'use strict';

const path = require('node:path');

const TARGETS = {
  antigravity: {
    id: 'antigravity',
    label: 'Antigravity',
    workflowProjection: 'workflows',
    workflowRoot: '.antigravity/workflows',
    skillRoot: '.antigravity/skills',
    rootAgentFile: true
  },
  windsurf: {
    id: 'windsurf',
    label: 'Windsurf',
    workflowProjection: 'workflows',
    workflowRoot: '.windsurf/workflows',
    skillRoot: '.windsurf/skills',
    rootAgentFile: true
  },
  cursor: {
    id: 'cursor',
    label: 'Cursor',
    workflowProjection: 'commands',
    workflowRoot: '.cursor/commands',
    skillRoot: '.cursor/skills',
    rootAgentFile: true
  },
  claude: {
    id: 'claude',
    label: 'Claude Code',
    workflowProjection: 'commands',
    workflowRoot: '.claude/commands',
    skillRoot: '.claude/skills',
    rootAgentFile: true
  },
  copilot: {
    id: 'copilot',
    label: 'GitHub Copilot',
    workflowProjection: 'prompts',
    workflowRoot: '.github/prompts',
    skillRoot: '.github/skills',
    rootAgentFile: true
  },
  codex: {
    id: 'codex',
    label: 'Codex',
    workflowProjection: 'router-skill',
    workflowRoot: '.codex/skills/vibecoding-system/references',
    skillRoot: '.codex/skills',
    routerSkillDir: 'vibecoding-system',
    rootAgentFile: true
  },
  trae: {
    id: 'trae',
    label: 'Trae',
    workflowProjection: 'router-skill',
    workflowRoot: '.trae/skills/vibecoding-system/references',
    skillRoot: '.trae/skills',
    routerSkillDir: 'vibecoding-system',
    rootAgentFile: true
  },
  qoder: {
    id: 'qoder',
    label: 'Qoder',
    workflowProjection: 'commands',
    workflowRoot: '.qoder/commands',
    skillRoot: '.qoder/skills',
    rootAgentFile: true
  },
  kilo: {
    id: 'kilo',
    label: 'Kilo Code',
    workflowProjection: 'workflows',
    workflowRoot: '.kilocode/workflows',
    skillRoot: '.kilocode/skills',
    rootAgentFile: true
  },
  opencode: {
    id: 'opencode',
    label: 'OpenCode',
    workflowProjection: 'commands',
    workflowRoot: '.opencode/commands',
    skillRoot: '.opencode/skills',
    rootAgentFile: true
  }
};

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function replaceMdExtension(relPath, suffix) {
  return relPath.replace(/\.md$/i, suffix);
}

function joinPosix(...parts) {
  return toPosix(path.posix.join(...parts));
}

function listTargets() {
  return Object.values(TARGETS);
}

function getTarget(targetId) {
  if (!targetId) {
    throw new Error('targetId is required');
  }

  const target = TARGETS[targetId];
  if (!target) {
    throw new Error(`Unsupported target: ${targetId}. Supported targets: ${listTargets().map((item) => item.id).join(', ')}`);
  }

  return target;
}

function projectWorkflowPath(target, workflowRelPath) {
  switch (target.workflowProjection) {
    case 'workflows':
    case 'commands':
    case 'router-skill':
      return joinPosix(target.workflowRoot, workflowRelPath);

    case 'prompts':
      return joinPosix(target.workflowRoot, replaceMdExtension(workflowRelPath, '.prompt.md'));

    default:
      throw new Error(`Unsupported workflow projection mode: ${target.workflowProjection}`);
  }
}

function projectSkillPath(target, skillRelPath) {
  return joinPosix(target.skillRoot, skillRelPath);
}

function getRouterSkillPath(target) {
  if (target.workflowProjection !== 'router-skill') {
    return null;
  }

  return joinPosix(target.skillRoot, target.routerSkillDir, 'SKILL.md');
}

module.exports = {
  TARGETS,
  getRouterSkillPath,
  getTarget,
  joinPosix,
  listTargets,
  projectSkillPath,
  projectWorkflowPath
};
