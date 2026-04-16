'use strict';

function info(message) {
  console.log(`[info] ${message}`);
}

function warn(message) {
  console.log(`[warn] ${message}`);
}

function error(message) {
  console.error(`[error] ${message}`);
}

function success(message) {
  console.log(`[ok] ${message}`);
}

function blank() {
  console.log('');
}

function section(title, lines) {
  console.log(title);
  for (const line of lines) {
    console.log(`  - ${line}`);
  }
}

function fileLine(relPath) {
  console.log(`  + ${relPath}`);
}

function skippedLine(relPath) {
  console.log(`  - ${relPath}`);
}

module.exports = {
  blank,
  error,
  fileLine,
  info,
  section,
  skippedLine,
  success,
  warn
};
