'use strict';

const { getRouterSkillPath, getTarget, projectSkillPath, projectWorkflowPath } = require('./adapters');
const {
  ROUTER_SKILL_TEMPLATE,
  ROOT_AGENTS_FILE,
  listCanonicalSkills,
  listCanonicalWorkflows,
  listScaffoldFiles,
  listSharedFiles
} = require('./resources');

async function buildInitPlan(targetIds = ['antigravity']) {
  const uniqueTargetIds = Array.from(new Set((targetIds.length > 0 ? targetIds : ['antigravity'])));
  const workflowFiles = await listCanonicalWorkflows();
  const skillFiles = await listCanonicalSkills();
  const scaffoldFiles = await listScaffoldFiles();
  const sharedFiles = await listSharedFiles();

  const sharedEntries = [
    {
      kind: 'root-agents',
      sourcePath: ROOT_AGENTS_FILE,
      outputPath: 'AGENTS.md'
    },
    ...sharedFiles.map((file) => ({
      kind: 'shared',
      sourcePath: file.sourcePath,
      outputPath: file.outputPath
    })),
    ...scaffoldFiles.map((file) => ({
      kind: 'scaffold',
      sourcePath: file.sourcePath,
      outputPath: file.outputPath
    }))
  ];

  const targetPlans = uniqueTargetIds.map((targetId) => {
    const target = getTarget(targetId);
    const entries = [
      ...workflowFiles.map((file) => ({
        kind: 'workflow',
        sourcePath: file.sourcePath,
        outputPath: projectWorkflowPath(target, file.relPath)
      })),
      ...skillFiles.map((file) => ({
        kind: 'skill',
        sourcePath: file.sourcePath,
        outputPath: projectSkillPath(target, file.relPath)
      }))
    ];

    const routerSkillPath = getRouterSkillPath(target);
    if (routerSkillPath) {
      entries.unshift({
        kind: 'router-skill',
        sourcePath: ROUTER_SKILL_TEMPLATE,
        outputPath: routerSkillPath
      });
    }

    return {
      targetId: target.id,
      targetLabel: target.label,
      entries,
      managedFiles: entries.map((entry) => entry.outputPath)
    };
  });

  return {
    sharedEntries,
    targetPlans
  };
}

module.exports = {
  buildInitPlan
};
