'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { buildInitPlan } = require('./manifest');
const { writeEntries } = require('./copy');
const { createInstallLock, writeInstallLock, INSTALL_LOCK_RELATIVE_PATH } = require('./install-state');
const { blank, fileLine, info, section, skippedLine, success, warn } = require('./output');

const { version } = require(path.join(__dirname, '..', '..', '..', 'package.json'));

async function init(options = {}) {
  const destinationDir = options.destinationDir || '.';
  const targetIds = options.targetIds || ['antigravity'];
  const force = options.force === true;
  const absoluteDestination = path.resolve(destinationDir);

  await fs.mkdir(absoluteDestination, { recursive: true });

  const plan = await buildInitPlan(targetIds);
  const selectedTargets = plan.targetPlans.map((targetPlan) => targetPlan.targetLabel).join(', ');

  info(`Generating VibeCoding template into ${absoluteDestination}`);
  info(`Selected targets: ${selectedTargets}`);
  info('Canonical sources: AGENTS.md, .antigravity/workflows/, .antigravity/skills/');
  info('Project scaffolding: generic .antigravity/docs, examples, genesis, artifacts placeholders');
  blank();

  const sharedResult = await writeEntries(absoluteDestination, plan.sharedEntries, { force });
  const targetResults = [];

  for (const targetPlan of plan.targetPlans) {
    targetResults.push({
      targetLabel: targetPlan.targetLabel,
      targetId: targetPlan.targetId,
      result: await writeEntries(absoluteDestination, targetPlan.entries, { force })
    });
  }

  const generatedAt = new Date().toISOString();
  await writeInstallLock(absoluteDestination, createInstallLock({
    cliVersion: version,
    generatedAt,
    sharedFiles: plan.sharedEntries.map((entry) => entry.outputPath),
    targetPlans: plan.targetPlans
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

  section('Target summary', targetResults.map((item) => {
    const writtenCount = item.result.written.length;
    const skippedCount = item.result.skipped.length;
    return `${item.targetLabel} (${item.targetId}): ${writtenCount} written, ${skippedCount} skipped`;
  }));

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

  blank();
  success(`Done. ${written.length} file(s) written for ${plan.targetPlans.length} target(s).`);
}

module.exports = {
  init
};
