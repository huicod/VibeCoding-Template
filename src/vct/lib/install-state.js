'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { detectInstalledTargets } = require('./adapters');

const INSTALL_LOCK_RELATIVE_PATH = '.vibe/install-lock.json';
const INSTALL_LOCK_VERSION = 2;

function getInstallLockPath(destinationRoot) {
  return path.join(destinationRoot, INSTALL_LOCK_RELATIVE_PATH);
}

function ensureString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid install-lock: ${fieldName} must be a non-empty string`);
  }

  return value;
}

function ensureObject(value, fieldName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid install-lock: ${fieldName} must be an object`);
  }

  return value;
}

function ensureArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid install-lock: ${fieldName} must be an array`);
  }

  return value;
}

function normalizeLastSuccessfulUpdate(input, fieldName) {
  if (input == null) {
    return null;
  }

  const normalized = ensureObject(input, fieldName);

  return {
    version: ensureString(normalized.version, `${fieldName}.version`),
    updatedAt: ensureString(normalized.updatedAt, `${fieldName}.updatedAt`)
  };
}

function normalizeTargetInstallation(input, versionFallback = 'unknown') {
  const normalized = ensureObject(input, 'targets[]');
  const targetId = ensureString(normalized.targetId, 'targets[].targetId');
  const targetLabel = ensureString(normalized.targetLabel, 'targets[].targetLabel');
  const installedVersion = typeof normalized.installedVersion === 'string' && normalized.installedVersion.trim() !== ''
    ? normalized.installedVersion
    : versionFallback;
  const managedFiles = Array.from(new Set(ensureArray(normalized.managedFiles || [], 'targets[].managedFiles'))).sort();
  const ownership = Array.from(new Set(
    ensureArray(normalized.ownership || [], 'targets[].ownership').length > 0
      ? normalized.ownership
      : managedFiles.map((file) => `${targetId}:${file}`)
  )).sort();

  return {
    targetId,
    targetLabel,
    installedVersion,
    managedFiles,
    ownership,
    lastSuccessfulUpdate: normalizeLastSuccessfulUpdate(normalized.lastSuccessfulUpdate, 'targets[].lastSuccessfulUpdate')
  };
}

function dedupeTargets(targets, versionFallback = 'unknown') {
  const map = new Map();

  for (const target of targets.map((item) => normalizeTargetInstallation(item, versionFallback))) {
    map.set(target.targetId, target);
  }

  return Array.from(map.values()).sort((left, right) => left.targetId.localeCompare(right.targetId));
}

function normalizeLastUpdateSummary(input) {
  if (input == null) {
    return null;
  }

  const summary = ensureObject(input, 'lastUpdateSummary');

  return {
    successfulTargets: Array.from(new Set(ensureArray(summary.successfulTargets || [], 'lastUpdateSummary.successfulTargets'))).sort(),
    failedTargets: Array.from(new Set(ensureArray(summary.failedTargets || [], 'lastUpdateSummary.failedTargets'))).sort(),
    updatedAt: ensureString(summary.updatedAt, 'lastUpdateSummary.updatedAt')
  };
}

function normalizeInstallLock(input) {
  const source = ensureObject(input, 'install-lock');
  const schemaVersion = source.schemaVersion ?? source.lockVersion ?? 1;

  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new Error('Invalid install-lock: schemaVersion must be a positive integer');
  }

  const cliVersion = ensureString(source.cliVersion, 'cliVersion');
  const generatedAt = ensureString(source.generatedAt, 'generatedAt');
  const sharedRoot = typeof source.sharedRoot === 'string' && source.sharedRoot.trim() !== ''
    ? source.sharedRoot
    : '.vibe';
  const sharedSource = source.shared == null
    ? {
        managedFiles: source.sharedFiles || [],
        bootstrapFiles: []
      }
    : ensureObject(source.shared, 'shared');
  const sharedManagedFiles = Array.from(new Set(
    ensureArray(sharedSource.managedFiles || [], 'shared.managedFiles')
  )).sort();
  const bootstrapFiles = Array.from(new Set(
    ensureArray(sharedSource.bootstrapFiles || [], 'shared.bootstrapFiles')
  )).sort();
  const targets = dedupeTargets(ensureArray(source.targets || [], 'targets'), cliVersion);

  return {
    schemaVersion,
    cliVersion,
    generatedAt,
    sharedRoot,
    shared: {
      managedFiles: sharedManagedFiles,
      bootstrapFiles
    },
    targets,
    lastUpdateSummary: normalizeLastUpdateSummary(source.lastUpdateSummary)
  };
}

function createInstallLock({
  cliVersion,
  generatedAt,
  sharedRoot = '.vibe',
  sharedManagedFiles = [],
  bootstrapFiles = [],
  targets = [],
  lastUpdateSummary = null
}) {
  return normalizeInstallLock({
    schemaVersion: INSTALL_LOCK_VERSION,
    cliVersion,
    generatedAt,
    sharedRoot,
    shared: {
      managedFiles: sharedManagedFiles,
      bootstrapFiles
    },
    targets,
    lastUpdateSummary
  });
}

async function readInstallLock(destinationRoot) {
  const lockPath = getInstallLockPath(destinationRoot);
  let raw;

  try {
    raw = await fs.readFile(lockPath, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return {
        exists: false,
        lockPath,
        lock: null,
        error: null
      };
    }

    throw error;
  }

  try {
    return {
      exists: true,
      lockPath,
      lock: normalizeInstallLock(JSON.parse(raw)),
      error: null
    };
  } catch (error) {
    return {
      exists: true,
      lockPath,
      lock: null,
      error: new Error(`Failed to read install-lock: ${error.message}`)
    };
  }
}

async function writeInstallLock(destinationRoot, lockInput) {
  const lockPath = getInstallLockPath(destinationRoot);
  const normalized = normalizeInstallLock(lockInput);

  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  await fs.writeFile(lockPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');

  return {
    lockPath,
    lock: normalized
  };
}

function summarizeTargetState(targetPlan, installedVersion, updatedAt = null) {
  return normalizeTargetInstallation({
    targetId: targetPlan.targetId,
    targetLabel: targetPlan.targetLabel,
    installedVersion,
    managedFiles: targetPlan.managedFiles,
    ownership: targetPlan.ownership,
    lastSuccessfulUpdate: updatedAt
      ? {
          version: installedVersion,
          updatedAt
        }
      : null
  }, installedVersion);
}

function detectLockDrift(lock, scannedTargets) {
  const lockTargetIds = new Set((lock?.targets || []).map((item) => item.targetId));
  const scannedTargetIds = new Set(scannedTargets.map((item) => item.id));
  const missingOnDisk = Array.from(lockTargetIds).filter((targetId) => !scannedTargetIds.has(targetId)).sort();
  const untrackedOnDisk = Array.from(scannedTargetIds).filter((targetId) => !lockTargetIds.has(targetId)).sort();

  return {
    hasDrift: missingOnDisk.length > 0 || untrackedOnDisk.length > 0,
    missingOnDisk,
    untrackedOnDisk
  };
}

async function detectInstallState(destinationRoot) {
  const lockResult = await readInstallLock(destinationRoot);
  const scannedTargets = await detectInstalledTargets(destinationRoot);
  const lockTargets = lockResult.lock?.targets || [];
  const needsFallback = !lockResult.exists || !!lockResult.error;
  const drift = detectLockDrift(lockResult.lock, scannedTargets);
  const shouldPreferScannedTargets = needsFallback || drift.hasDrift || lockTargets.length === 0;

  return {
    lockResult,
    scannedTargets,
    selectedTargets: shouldPreferScannedTargets
      ? scannedTargets.map((item) => item.id)
      : lockTargets.map((item) => item.targetId),
    drift,
    needsFallback,
    fallbackReason: !needsFallback
      ? null
      : (lockResult.exists ? 'invalid_lock' : 'missing_lock'),
    stateSource: needsFallback
      ? 'directory_scan_fallback'
      : (drift.hasDrift ? 'directory_scan_drift' : 'install_lock'),
    canRebuildLock: (needsFallback || drift.hasDrift) && scannedTargets.length > 0
  };
}

module.exports = {
  INSTALL_LOCK_RELATIVE_PATH,
  INSTALL_LOCK_VERSION,
  createInstallLock,
  dedupeTargets,
  detectInstallState,
  detectLockDrift,
  getInstallLockPath,
  normalizeInstallLock,
  normalizeTargetInstallation,
  readInstallLock,
  summarizeTargetState,
  writeInstallLock
};
