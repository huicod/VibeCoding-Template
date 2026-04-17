'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const README_PATH = path.join(__dirname, '..', '..', '..', 'README.md');

test('README documents the current shared roots and maintainer commands', async () => {
  const readme = await fs.readFile(README_PATH, 'utf8');

  assert.match(readme, /VibeCoding Template/);
  assert.match(readme, /为什么需要这个模板/);
  assert.match(readme, /架构来源/);
  assert.match(readme, /TARGET_PROJECT/);
  assert.match(readme, /`\.vibe\/docs\/`/);
  assert.match(readme, /`\.agents\/workflows\/`/);
  assert.match(readme, /`\.agents\/skills\/`/);
  assert.match(readme, /\/genesis/);
  assert.match(readme, /\/forge/);
  assert.match(readme, /vct init \./);
  assert.match(readme, /vct update \./);
  assert.match(readme, /bash \.\/out\/demo\/\.agents\/scripts\/check-template-consistency\.sh/);

  assert.doesNotMatch(readme, /\.antigravity\/scripts\/check-template-consistency\.sh/);
  assert.doesNotMatch(readme, /`\.antigravity\/docs\/`/);
  assert.doesNotMatch(readme, /`\.antigravity\/examples\/`/);
});
