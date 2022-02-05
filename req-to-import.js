#!/usr/bin/env node

// from https://github.com/jameswomack/replace-require-with-import/blob/master/index.js
// changes: support importing files with a `@` in their names, support require with multiple keys `{ funcA, funcB }`
// usage: `node ./require-to-import.js ./src/**/*.ts`

import FS     from 'fs';
import { globbySync, globby } from 'globby';

const r1     = /^(let|var|const) +([a-zA-Z_$][a-zA-Z0-9_$]*) +\= +(require)\((('|")[@a-zA-Z0-9-_.\/]+('|"))\)/gm // const createStore = require('redux')
const r2     = /^(let|var|const) +([a-zA-Z_$][a-zA-Z0-9_$]*) +\= +(require)\((('|")[@a-zA-Z0-9-_.\/]+('|"))\)\.([a-zA-Z][a-zA-Z0-9]+)/gm // const createStore = require('redux').createStore
const r3     = /^(let|var|const) +(\{\s*((?:[a-zA-Z_$][a-zA-Z0-9_$]*)(?:\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*))*)\s*\}) += +(require)\((('|")[@a-zA-Z0-9-_.\/]+('|"))\)/gm; // const { createStore } = require('redux')

const args = process.argv.slice(2)

if (!args.length) {
  console.error('Please pass a directory glob to "replace-require-with-import"\n')
  process.exit(1)
}

const paths = globbySync(args)

paths.forEach(function (p) {
  if (!FS.statSync(p).isDirectory()) {
    return replaceInFile(p)
  }
})

function replaceInFile(fp) {
  const result = FS.writeFileSync(fp, FS.readFileSync(fp, 'utf-8')
    .replace(r3, `import { $3 } from $6`)
    .replace(r2, `import { $7 as $2 } from $4`)
    .replace(r1, `import $2 from $4`), 'utf-8')
  console.log(`> ${fp}`)
  return result
}

console.info('Done!\n')