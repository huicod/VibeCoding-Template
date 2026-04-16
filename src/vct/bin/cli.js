#!/usr/bin/env node
'use strict';

const { parseArgs } = require('node:util');
const path = require('node:path');
const { listTargets, getTarget } = require('../lib/adapters');
const { init } = require('../lib/init');
const { error } = require('../lib/output');

const { version } = require(path.join(__dirname, '..', '..', '..', 'package.json'));
const TARGET_IDS = listTargets().map((target) => target.id);

const HELP = `
USAGE
  vct init [output-dir] [options]

COMMANDS
  init      Generate one or more platform projections into an output directory

OPTIONS
  -v, --version   Print version number
  -h, --help      Show this help message
  -f, --force     Overwrite existing managed files
  --target        Target platform ids, comma-separated (${TARGET_IDS.join(', ')})

EXAMPLES
  vct init . --target antigravity
  vct init ./out/demo --target antigravity,cursor,claude,codex
`.trimStart();

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    version: { type: 'boolean', short: 'v', default: false },
    help: { type: 'boolean', short: 'h', default: false },
    force: { type: 'boolean', short: 'f', default: false },
    target: { type: 'string' }
  },
  strict: false,
  allowPositionals: true
});

function parseTargetIds(raw) {
  if (!raw) {
    return ['antigravity'];
  }

  const targetIds = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (targetIds.length === 0) {
    return ['antigravity'];
  }

  targetIds.forEach((targetId) => getTarget(targetId));
  return Array.from(new Set(targetIds));
}

async function main() {
  if (values.version) {
    console.log(version);
    return;
  }

  if (values.help || positionals.length === 0) {
    console.log(HELP.trimEnd());
    return;
  }

  const command = positionals[0];

  switch (command) {
    case 'init': {
      const outputDir = positionals[1] || '.';
      const targetIds = parseTargetIds(values.target);

      await init({
        destinationDir: outputDir,
        targetIds,
        force: values.force
      });
      return;
    }

    default:
      error(`Unknown command: ${command}`);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  error(err.stack || err.message);
  process.exitCode = 1;
});
