#!/usr/bin/env node

import { readFile, writeFile, mkdir, mkdtemp, rm, access, rename } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const DATA_FILE = 'diving-center/data/diving.json';
const LOGOS_DIR = 'diving-center/images/logos';
const SOURCES_DIR = '/private/tmp/diving-logo-sources';
const CONCURRENCY = 8;
const sourcePattern = /^https:\/\/my\.divessi\.com\/data\/Image\/facility_logos\/(\d+)\.png$/;

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: 'ignore' });
  child.once('error', reject);
  child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
});

const fileExists = async path => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const args = process.argv.slice(2);
const shardArgument = args.indexOf('--shard');
const finalize = args.includes('--finalize');
const source = await readFile(DATA_FILE, 'utf8');
const data = JSON.parse(source);
const logos = new Map();

for (const center of data.centers) {
  const match = center.logo?.match(sourcePattern);
  if (match) logos.set(center.logo, `divessi-${match[1]}.webp`);
}

await mkdir(LOGOS_DIR, { recursive: true });
const tempDir = await mkdtemp(join(tmpdir(), 'diving-logos-'));
const downloaded = new Set();
const failures = [];
let jobs = [...logos.entries()];
if (shardArgument !== -1) {
  const [part, total] = args[shardArgument + 1]?.split('/').map(Number) ?? [];
  if (!Number.isInteger(part) || !Number.isInteger(total) || part < 1 || part > total) {
    throw new Error('Use --shard <part>/<total>, for example --shard 1/4.');
  }
  jobs = jobs.filter((_, index) => index % total === part - 1);
}
let completed = 0;

async function download([url, filename]) {
  const output = join(LOGOS_DIR, filename);
  try {
    if (!await fileExists(output)) {
      const input = join(SOURCES_DIR, filename.replace(/\.webp$/, '.source'));
      const temporaryOutput = join(tempDir, filename);
      if (!await fileExists(input)) throw new Error('source file not downloaded');
      await run('cwebp', ['-quiet', '-q', '82', input, '-o', temporaryOutput]);
      await rename(temporaryOutput, output);
    }
    downloaded.add(url);
  } catch (error) {
    failures.push(`${url}: ${error.message}`);
  } finally {
    completed += 1;
    if (completed % 100 === 0 || completed === jobs.length) {
      console.log(`${completed}/${jobs.length}`);
    }
  }
}

for (let index = 0; index < jobs.length; index += CONCURRENCY) {
  await Promise.all(jobs.slice(index, index + CONCURRENCY).map(download));
}

if (finalize) {
  let updated = source;
  for (const [url, filename] of logos) {
    if (await fileExists(join(LOGOS_DIR, filename))) {
      updated = updated.replaceAll(url, `images/logos/${filename}`);
    }
  }
  if (updated !== source) await writeFile(DATA_FILE, updated);
}

await rm(tempDir, { recursive: true, force: true });

if (failures.length) {
  console.error(`Failed downloads (${failures.length}):\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Downloaded or verified ${downloaded.size} logos.`);
}
