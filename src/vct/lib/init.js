'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { DEFAULT_TARGET_IDS, getTarget, getTargetRootDirs, pathExists } = require('./adapters');
const { buildProjectionPlan } = require('./manifest');
const { writeEntries } = require('./copy');
const {
  createInstallLock,
  dedupeTargets,
  detectInstallState,
  summarizeTargetState,
  writeInstallLock,
  INSTALL_LOCK_RELATIVE_PATH
} = require('./install-state');
const { blank, fileLine, info, section, skippedLine, success, warn } = require('./output');

const { version } = require(path.join(__dirname, '..', '..', '..', 'package.json'));

async function resolveSafeTargetIds({ destinationRoot, requestedTargetIds, installState, force }) {
  if (force) {
    return {
      allowedTargetIds: requestedTargetIds,
      blockedTargets: []
    };
  }

  const sharedRootExists = await pathExists(path.join(destinationRoot, '.vibe'));
  const ownedTargetIds = new Set((installState.lockResult.lock?.targets || []).map((target) => target.targetId));
  const allowedTargetIds = [];
  const blockedTargets = [];

  for (const targetId of requestedTargetIds) {
    const target = getTarget(targetId);

    if (sharedRootExists || ownedTargetIds.has(targetId)) {
      allowedTargetIds.push(targetId);
      continue;
    }

    const existingRoots = [];
    for (const rootDir of getTargetRootDirs(target)) {
      if (await pathExists(path.join(destinationRoot, rootDir))) {
        existingRoots.push(rootDir);
      }
    }

    if (existingRoots.length > 0) {
      blockedTargets.push({
        targetId: target.id,
        targetLabel: target.label,
        existingRoots
      });
      continue;
    }

    allowedTargetIds.push(targetId);
  }

  return {
    allowedTargetIds,
    blockedTargets
  };
}

function buildRetainedTargets({ installState, detectedTargetPlans, excludedTargetIds, allowDetectedTargets }) {
  const retained = new Map();
  const excluded = new Set(excludedTargetIds);

  if (allowDetectedTargets) {
    for (const targetPlan of detectedTargetPlans) {
      if (!excluded.has(targetPlan.targetId)) {
        retained.set(targetPlan.targetId, summarizeTargetState(targetPlan, version));
      }
    }
  }

  for (const target of installState.lockResult.lock?.targets || []) {
    if (!excluded.has(target.targetId)) {
      retained.set(target.targetId, target);
    }
  }

  return Array.from(retained.values());
}

async function resolveSharedWorkspaceSafety({ destinationRoot, installState, force }) {
  if (force || installState.lockResult.exists || await pathExists(path.join(destinationRoot, '.vibe'))) {
    return {
      blockedPaths: []
    };
  }

  const blockedPaths = [];

  if (await pathExists(path.join(destinationRoot, 'AGENTS.md'))) {
    blockedPaths.push('AGENTS.md');
  }

  if (await pathExists(path.join(destinationRoot, '.agents'))) {
    blockedPaths.push('.agents/');
  }

  return {
    blockedPaths
  };
}

async function init(options = {}) {
  const destinationDir = options.destinationDir || '.';
  const targetIds = options.targetIds || DEFAULT_TARGET_IDS.slice();
  const force = options.force === true;
  const absoluteDestination = path.resolve(destinationDir);

  await fs.mkdir(absoluteDestination, { recursive: true });

  const installState = await detectInstallState(absoluteDestination);
  const safeSelection = await resolveSafeTargetIds({
    destinationRoot: absoluteDestination,
    requestedTargetIds: targetIds,
    installState,
    force
  });
  const sharedSafety = await resolveSharedWorkspaceSafety({
    destinationRoot: absoluteDestination,
    installState,
    force
  });
  const sharedRootExists = await pathExists(path.join(absoluteDestination, '.vibe'));
  const plan = await buildProjectionPlan(safeSelection.allowedTargetIds);
  const detectedPlan = installState.selectedTargets.length > 0
    ? await buildProjectionPlan(installState.selectedTargets)
    : { targetPlans: [] };
  const selectedTargets = plan.targetPlans.map((targetPlan) => targetPlan.targetLabel).join(', ');

  if (sharedSafety.blockedPaths.length > 0) {
    throw new Error(`Found pre-existing workspace-owned shared roots/files: ${sharedSafety.blockedPaths.join(', ')}. Refusing to adopt them silently. Use a clean workspace, a dedicated output directory, or --force if you intentionally want to manage those paths.`);
  }

  info(`Generating VibeCoding template into ${absoluteDestination}`);
  info(`Selected targets: ${selectedTargets || 'none'}`);
  info('Template source of truth: src/vct/templates/AGENTS.md, src/vct/templates/.agents/, src/vct/templates/scaffold/.vibe/');
  info('Generated shared roots: .agents/ for workflows and skills, .vibe/ for project context and state');
  info('Generated compatibility shells: platform directories only keep wrapper entrypoints');
  if (safeSelection.blockedTargets.length > 0) {
    warn('Skipped targets with pre-existing workspace-owned roots:');
    for (const target of safeSelection.blockedTargets) {
      skippedLine(`${target.targetLabel} (${target.targetId}) -> ${target.existingRoots.join(', ')}`);
    }
    info('Use a clean workspace, a dedicated output directory, or `--force` only if you intentionally want to adopt those paths.');
  }
  blank();

  if (plan.targetPlans.length === 0) {
    throw new Error('No safe targets remain after collision checks. Nothing was generated.');
  }

  const sharedResult = await writeEntries(absoluteDestination, plan.sharedEntries, { force });
  const targetResults = [];
  const successfulTargets = [];
  const failedTargets = [];

  for (const targetPlan of plan.targetPlans) {
    try {
      const result = await writeEntries(absoluteDestination, targetPlan.entries, { force });
      targetResults.push({
        targetLabel: targetPlan.targetLabel,
        targetId: targetPlan.targetId,
        result
      });
      successfulTargets.push(summarizeTargetState(targetPlan, version));
    } catch (error) {
      failedTargets.push({
        targetId: targetPlan.targetId,
        targetLabel: targetPlan.targetLabel,
        reason: error.message
      });
    }
  }

  const generatedAt = new Date().toISOString();
  const retainedTargets = buildRetainedTargets({
    installState,
    detectedTargetPlans: detectedPlan.targetPlans,
    excludedTargetIds: successfulTargets.map((target) => target.targetId),
    allowDetectedTargets: sharedRootExists || installState.lockResult.exists
  });

  await writeInstallLock(absoluteDestination, createInstallLock({
    cliVersion: version,
    generatedAt,
    sharedManagedFiles: plan.sharedManagedFiles,
    bootstrapFiles: plan.bootstrapFiles,
    targets: dedupeTargets([
      ...retainedTargets,
      ...successfulTargets
    ], version),
    lastUpdateSummary: {
      successfulTargets: successfulTargets.map((target) => target.targetId),
      failedTargets: failedTargets.map((target) => target.targetId),
      updatedAt: generatedAt
    }
  }));

  const written = [
    ...sharedResult.written,
    ...targetResults.flatMap((item) => item.result.written),
    INSTALL_LOCK_RELATIVE_PATH
  ];
  const skipped = [
    ...sharedResult.skipped,
    ...targetResults.flatMap((item) => item.result.skipped)
  ];

  section('Target summary', [
    ...targetResults.map((item) => {
      const writtenCount = item.result.written.length;
      const skippedCount = item.result.skipped.length;
      return `${item.targetLabel} (${item.targetId}): ${writtenCount} written, ${skippedCount} skipped`;
    }),
    ...failedTargets.map((item) => `${item.targetLabel} (${item.targetId}): failed - ${item.reason}`)
  ]);

  blank();
  info('Written files:');
  for (const relPath of written) {
    fileLine(relPath);
  }

  if (skipped.length > 0) {
    blank();
    warn('Skipped existing files:');
    for (const relPath of skipped) {
      skippedLine(relPath);
    }
  }

  if (failedTargets.length > 0) {
    blank();
    warn('Some targets failed during init, but successful targets were preserved in install-lock.');
  }

  blank();
  success(`Done. ${written.length} file(s) written for ${successfulTargets.length} successful target(s).`);
}

module.exports = {
  init
};
