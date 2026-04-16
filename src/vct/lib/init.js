'use strict';

const fs = require('node:fs/promises');
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

async function init(options = {}) {
  const destinationDir = options.destinationDir || '.';
  const targetIds = options.targetIds || ['antigravity'];
  const force = options.force === true;
  const absoluteDestination = path.resolve(destinationDir);

  await fs.mkdir(absoluteDestination, { recursive: true });

  const plan = await buildProjectionPlan(targetIds);
  const installState = await detectInstallState(absoluteDestination);
  const detectedPlan = installState.selectedTargets.length > 0
    ? await buildProjectionPlan(installState.selectedTargets)
    : { targetPlans: [] };
  const selectedTargets = plan.targetPlans.map((targetPlan) => targetPlan.targetLabel).join(', ');

  info(`Generating VibeCoding template into ${absoluteDestination}`);
  info(`Selected targets: ${selectedTargets}`);
  info('Repository source of truth: AGENTS.md, .antigravity/workflows/, .antigravity/skills/');
  info('Generated shared core: .vibe/');
  info('Generated compatibility shells: platform directories only keep wrapper entrypoints');
  blank();

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
    excludedTargetIds: successfulTargets.map((target) => target.targetId)
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
