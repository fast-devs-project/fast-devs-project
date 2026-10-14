#!/usr/bin/env node

import { readFile, writeFile, unlink } from 'node:fs/promises';

const DATA_FILE = 'diving-center/data/diving.json';
const OCEAN_FILE = '/private/tmp/ne_10m_ocean.geojson';
const LOGOS_DIR = 'diving-center/images/logos';
const MAX_DISTANCE_KM = 10;
const CELL_DEGREES = 0.25;
const X_CELLS = Math.round(360 / CELL_DEGREES);
const apply = process.argv.includes('--apply');

const normalizeLon = lon => ((lon + 180) % 360 + 360) % 360 - 180;
const cellKey = (x, y) => `${((x % X_CELLS) + X_CELLS) % X_CELLS},${y}`;
const lonCell = lon => Math.floor((normalizeLon(lon) + 180) / CELL_DEGREES);
const latCell = lat => Math.floor((lat + 90) / CELL_DEGREES);

const ocean = JSON.parse(await readFile(OCEAN_FILE, 'utf8'));
const segments = [];
const index = new Map();
const addSegment = (first, second) => {
  let [lon1, lat1] = first;
  let [lon2, lat2] = second;
  if (Math.abs(lon2 - lon1) > 180) lon2 += lon2 > lon1 ? -360 : 360;
  const segment = { lon1, lat1, lon2, lat2 };
  const id = segments.push(segment) - 1;
  const minX = Math.floor((Math.min(lon1, lon2) + 180) / CELL_DEGREES);
  const maxX = Math.floor((Math.max(lon1, lon2) + 180) / CELL_DEGREES);
  const minY = latCell(Math.min(lat1, lat2));
  const maxY = latCell(Math.max(lat1, lat2));
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      const key = cellKey(x, y);
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(id);
    }
  }
};
const addGeometry = geometry => {
  if (!geometry) return;
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  for (const polygon of polygons) for (const ring of polygon) {
    for (let i = 1; i < ring.length; i += 1) addSegment(ring[i - 1], ring[i]);
  }
};
for (const feature of ocean.features) addGeometry(feature.geometry);

const pointToSegmentKm = (lat, lon, segment) => {
  const cosine = Math.cos(lat * Math.PI / 180);
  const x1 = normalizeLon(segment.lon1 - lon) * 111.32 * cosine;
  const y1 = (segment.lat1 - lat) * 110.57;
  const x2 = normalizeLon(segment.lon2 - lon) * 111.32 * cosine;
  const y2 = (segment.lat2 - lat) * 110.57;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const ratio = Math.max(0, Math.min(1, -(x1 * dx + y1 * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(x1 + ratio * dx, y1 + ratio * dy);
};
const distanceToSeaKm = ({ latitude, longitude }) => {
  const latPad = MAX_DISTANCE_KM / 110.57 + CELL_DEGREES;
  const lonPad = MAX_DISTANCE_KM / (111.32 * Math.max(0.01, Math.cos(latitude * Math.PI / 180))) + CELL_DEGREES;
  const candidates = new Set();
  const x = lonCell(longitude);
  const yMin = latCell(latitude - latPad);
  const yMax = latCell(latitude + latPad);
  const xPad = Math.ceil(lonPad / CELL_DEGREES);
  for (let dx = -xPad; dx <= xPad; dx += 1) for (let y = yMin; y <= yMax; y += 1) {
    for (const id of index.get(cellKey(x + dx, y)) ?? []) candidates.add(id);
  }
  let distance = Infinity;
  for (const id of candidates) distance = Math.min(distance, pointToSegmentKm(latitude, longitude, segments[id]));
  return distance;
};

const source = await readFile(DATA_FILE, 'utf8');
const data = JSON.parse(source);
const removed = [];
const kept = [];
for (const center of data.centers) {
  const coordinates = center.location?.coordinates;
  if (!Number.isFinite(coordinates?.latitude) || !Number.isFinite(coordinates?.longitude)) {
    removed.push({ center, distanceKm: null, reason: 'missing coordinates' });
    continue;
  }
  const distanceKm = distanceToSeaKm(coordinates);
  (distanceKm <= MAX_DISTANCE_KM ? kept : removed).push({ center, distanceKm });
}

const report = {
  thresholdKm: MAX_DISTANCE_KM,
  coastlineSource: 'Natural Earth 1:10m ocean polygons',
  kept: kept.length,
  removed: removed.length,
  removedCenters: removed.map(({ center, distanceKm, reason }) => ({
    name: center.name,
    city: center.location?.city,
    country: center.location?.country,
    distanceKm: Number.isFinite(distanceKm) ? Number(distanceKm.toFixed(2)) : null,
    reason
  }))
};
await writeFile('/private/tmp/inland-diving-centers-report.json', `${JSON.stringify(report, null, 2)}\n`);

if (apply) {
  const removedLogos = new Set(removed.map(({ center }) => center.logo).filter(Boolean));
  data.centers = kept.map(({ center }) => center);
  await writeFile(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`);
  const retainedLogos = new Set(data.centers.map(center => center.logo).filter(Boolean));
  for (const logo of removedLogos) {
    if (retainedLogos.has(logo) || !logo.startsWith('images/logos/')) continue;
    await unlink(`${LOGOS_DIR}/${logo.slice('images/logos/'.length)}`);
  }
}

console.log(JSON.stringify({ kept: kept.length, removed: removed.length, report: '/private/tmp/inland-diving-centers-report.json' }));
