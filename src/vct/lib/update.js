'use strict';

const path = require('node:path');
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

function buildRetainedTargets({ installState, detectedTargetPlans, excludedTargetIds }) {
  const retained = new Map();
  const excluded = new Set(excludedTargetIds);

  for (const targetPlan of detectedTargetPlans) {
    if (!excluded.has(targetPlan.targetId)) {
      retained.set(targetPlan.targetId, summarizeTargetState(targetPlan, version));
    }
  }

  for (const target of installState.lockResult.lock?.targets || []) {
    if (!excluded.has(target.targetId)) {
      retained.set(target.targetId, target);
    }
  }

  return Array.from(retained.values());
}

async function update(options = {}) {
  const destinationDir = options.destinationDir || '.';
  const absoluteDestination = path.resolve(destinationDir);
  const installState = await detectInstallState(absoluteDestination);

  if (installState.selectedTargets.length === 0) {
    throw new Error('No supported VibeCoding target layout found in the destination. Run `vct init` first.');
  }

  const plan = await buildProjectionPlan(installState.selectedTargets);
  const selectedTargets = plan.targetPlans.map((targetPlan) => `${targetPlan.targetLabel} (${targetPlan.targetId})`).join(', ');

  info(`Updating VibeCoding template in ${absoluteDestination}`);
  info(`Matched targets: ${selectedTargets}`);
  info(`State source: ${installState.stateSource}`);
  if (installState.drift.hasDrift) {
    warn(`State drift detected. Missing on disk: ${installState.drift.missingOnDisk.join(', ') || 'none'}; untracked on disk: ${installState.drift.untrackedOnDisk.join(', ') || 'none'}`);
  }
  blank();

  const sharedResult = await writeEntries(absoluteDestination, plan.sharedManagedEntries, {
    force: true,
    skipIfUnchanged: true
  });
  const targetResults = [];
  const successfulTargets = [];
  const failedTargets = [];
  const updatedAt = new Date().toISOString();

  for (const targetPlan of plan.targetPlans) {
    try {
      const result = await writeEntries(absoluteDestination, targetPlan.entries, {
        force: true,
        skipIfUnchanged: true
      });
      targetResults.push({
        targetId: targetPlan.targetId,
        targetLabel: targetPlan.targetLabel,
        result
      });
      successfulTargets.push(summarizeTargetState(targetPlan, version, updatedAt));
    } catch (error) {
      failedTargets.push({
        targetId: targetPlan.targetId,
        targetLabel: targetPlan.targetLabel,
        reason: error.message
      });
    }
  }

  const retainedTargets = buildRetainedTargets({
    installState,
    detectedTargetPlans: plan.targetPlans,
    excludedTargetIds: successfulTargets.map((target) => target.targetId)
  });

  await writeInstallLock(absoluteDestination, createInstallLock({
    cliVersion: version,
    generatedAt: updatedAt,
    sharedManagedFiles: plan.sharedManagedFiles,
    bootstrapFiles: plan.bootstrapFiles,
    targets: dedupeTargets([
      ...retainedTargets,
      ...successfulTargets
    ], version),
    lastUpdateSummary: {
      successfulTargets: successfulTargets.map((target) => target.targetId),
      failedTargets: failedTargets.map((target) => target.targetId),
      updatedAt
    }
  }));

  const written = [
    ...sharedResult.written,
    ...targetResults.flatMap((item) => item.result.written),
    INSTALL_LOCK_RELATIVE_PATH
  ];
  const unchanged = [
    ...sharedResult.unchanged,
    ...targetResults.flatMap((item) => item.result.unchanged)
  ];
  const preserved = [
    ...sharedResult.skipped,
    ...targetResults.flatMap((item) => item.result.skipped)
  ];

  if (written.length > 0) {
    info('Updated files:');
    for (const relPath of written) {
      fileLine(relPath);
    }
    blank();
  }

  if (unchanged.length > 0) {
    info('Already current:');
    for (const relPath of unchanged) {
      skippedLine(relPath);
    }
    blank();
  }

  if (preserved.length > 0) {
    warn('Preserved files:');
    for (const relPath of preserved) {
      skippedLine(relPath);
    }
    blank();
  }

  section('Update summary', [
    ...targetResults.map((item) => {
      const updatedCount = item.result.written.length;
      const unchangedCount = item.result.unchanged.length;
      return `${item.targetLabel} (${item.targetId}): ${updatedCount} updated, ${unchangedCount} unchanged`;
    }),
    ...failedTargets.map((item) => `${item.targetLabel} (${item.targetId}): failed - ${item.reason}`)
  ]);

  blank();
  if (written.length === 1 && written[0] === INSTALL_LOCK_RELATIVE_PATH && failedTargets.length === 0) {
    success('Already up to date. install-lock was refreshed from the current target layout.');
    return;
  }

  if (written.length === 0 && failedTargets.length === 0) {
    success('Already up to date. No managed files needed changes.');
    return;
  }

  if (failedTargets.length > 0) {
    warn('Update completed with partial success. Successful targets were recorded in install-lock.');
  } else {
    success(`Done. ${written.length} file(s) updated across ${successfulTargets.length} target(s).`);
  }
}

module.exports = {
  update
};
