'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const INSTALL_LOCK_RELATIVE_PATH = '.vct/install-lock.json';
const INSTALL_LOCK_VERSION = 1;

function createInstallLock({ cliVersion, generatedAt, sharedFiles = [], targetPlans = [] }) {
  return {
    schemaVersion: INSTALL_LOCK_VERSION,
    cliVersion,
    generatedAt,
    sharedFiles: Array.from(new Set(sharedFiles)).sort(),
    targets: targetPlans.map((targetPlan) => ({
      targetId: targetPlan.targetId,
      targetLabel: targetPlan.targetLabel,
      managedFiles: targetPlan.managedFiles.slice().sort()
    }))
  };
}

async function writeInstallLock(destinationRoot, lock) {
  const lockPath = path.join(destinationRoot, INSTALL_LOCK_RELATIVE_PATH);
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
  return lockPath;
}

module.exports = {
  INSTALL_LOCK_RELATIVE_PATH,
  INSTALL_LOCK_VERSION,
  createInstallLock,
  writeInstallLock
};
