'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { getRouterSkillPath, getTarget, projectSkillPath, projectWorkflowPath } = require('./adapters');
const {
  COMMON_ROOT,
  ROUTER_SKILL_TEMPLATE,
  ROOT_AGENTS_FILE,
  listCanonicalScripts,
  listCanonicalSkillEntrypoints,
  listCanonicalSkills,
  listCanonicalWorkflows,
  listScaffoldFiles,
  listSharedFiles,
  rewriteGeneratedText
} = require('./resources');

function joinPosix(...parts) {
  return path.posix.join(...parts);
}

async function buildTextEntry(sourcePath, outputPath, kind) {
  return {
    kind,
    sourcePath,
    outputPath,
    content: rewriteGeneratedText(await fs.readFile(sourcePath, 'utf8'))
  };
}

function buildWorkflowWrapper({ target, workflowRelPath }) {
  const workflowName = path.posix.basename(workflowRelPath, '.md');
  const sharedWorkflowPath = joinPosix(COMMON_ROOT, 'workflows', workflowRelPath);

  return [
    `# ${workflowName} Compatibility Wrapper`,
    '',
    `This ${target.label} entry delegates to the shared VibeCoding workflow source of truth.`,
    '',
    'Read and follow the canonical workflow file:',
    `- \`${sharedWorkflowPath}\``,
    '',
    'Shared project context lives under:',
    `- \`${COMMON_ROOT}/docs/\``,
    `- \`${COMMON_ROOT}/examples/\``,
    `- \`${COMMON_ROOT}/genesis/\``,
    `- \`${COMMON_ROOT}/artifacts/\``,
    `- \`${COMMON_ROOT}/skills/\``,
    '',
    'If this wrapper and the shared workflow ever differ, treat the shared workflow as canonical.'
  ].join('\n') + '\n';
}

function buildSkillWrapper({ target, skillRelPath }) {
  const skillName = path.posix.dirname(skillRelPath);
  const sharedSkillPath = joinPosix(COMMON_ROOT, 'skills', skillRelPath);
  const sharedSkillDir = joinPosix(COMMON_ROOT, 'skills', skillName);

  return [
    `# ${skillName} Compatibility Wrapper`,
    '',
    `This ${target.label} entry exists so the platform can discover the shared VibeCoding skill.`,
    '',
    'Use the canonical shared skill definition:',
    `- \`${sharedSkillPath}\``,
    '',
    'When that skill references extra files, resolve them from:',
    `- \`${sharedSkillDir}/\``,
    '',
    'Do not edit this wrapper as the primary source of truth.'
  ].join('\n') + '\n';
}

async function buildProjectionPlan(targetIds = ['antigravity']) {
  const uniqueTargetIds = Array.from(new Set((targetIds.length > 0 ? targetIds : ['antigravity'])));
  const workflowFiles = await listCanonicalWorkflows();
  const skillFiles = await listCanonicalSkills();
  const skillEntrypoints = await listCanonicalSkillEntrypoints();
  const scriptFiles = await listCanonicalScripts();
  const scaffoldFiles = await listScaffoldFiles();
  const sharedFiles = await listSharedFiles();

  const sharedManagedEntries = [
    await buildTextEntry(ROOT_AGENTS_FILE, 'AGENTS.md', 'root-agents'),
    ...await Promise.all(sharedFiles.map((file) => buildTextEntry(file.sourcePath, file.outputPath, 'shared'))),
    ...await Promise.all(workflowFiles.map((file) => buildTextEntry(file.sourcePath, joinPosix(COMMON_ROOT, 'workflows', file.relPath), 'common-workflow'))),
    ...await Promise.all(skillFiles.map((file) => buildTextEntry(file.sourcePath, joinPosix(COMMON_ROOT, 'skills', file.relPath), 'common-skill'))),
    ...await Promise.all(scriptFiles.map((file) => buildTextEntry(file.sourcePath, joinPosix(COMMON_ROOT, 'scripts', file.relPath), 'common-script')))
  ];
  const bootstrapEntries = await Promise.all(
    scaffoldFiles.map((file) => buildTextEntry(file.sourcePath, file.outputPath, 'scaffold'))
  );
  const targetPlans = [];

  for (const targetId of uniqueTargetIds) {
    const target = getTarget(targetId);
    const entries = [];

    if (target.workflowProjection !== 'router-skill') {
      for (const file of workflowFiles) {
        entries.push({
          kind: 'workflow-wrapper',
          outputPath: projectWorkflowPath(target, file.relPath),
          content: buildWorkflowWrapper({
            target,
            workflowRelPath: file.relPath
          })
        });
      }
    }

    for (const file of skillEntrypoints) {
      entries.push({
        kind: 'skill-wrapper',
        outputPath: projectSkillPath(target, file.relPath),
        content: buildSkillWrapper({
          target,
          skillRelPath: file.relPath
        })
      });
    }

    const routerSkillPath = getRouterSkillPath(target);
    if (routerSkillPath) {
      entries.unshift(await buildTextEntry(ROUTER_SKILL_TEMPLATE, routerSkillPath, 'router-skill'));
    }

    targetPlans.push({
      targetId: target.id,
      targetLabel: target.label,
      entries,
      managedFiles: entries.map((entry) => entry.outputPath),
      ownership: entries.map((entry) => `${target.id}:${entry.outputPath}`)
    });
  }

  return {
    sharedEntries: [
      ...sharedManagedEntries,
      ...bootstrapEntries
    ],
    sharedManagedEntries,
    bootstrapEntries,
    sharedManagedFiles: sharedManagedEntries.map((entry) => entry.outputPath),
    bootstrapFiles: bootstrapEntries.map((entry) => entry.outputPath),
    targetPlans
  };
}

module.exports = {
  buildProjectionPlan,
  buildInitPlan: buildProjectionPlan
};
