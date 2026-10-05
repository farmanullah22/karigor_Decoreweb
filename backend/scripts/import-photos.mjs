/**
 * Bulk photo importer.
 *
 * Point it at a folder of real photos and it will:
 *   1. upload each file to the media library (so it shows up in the dashboard),
 *   2. attach the uploaded image to the matching product, project, service,
 *      homepage hero slide or gallery.
 *
 * Naming convention (case-insensitive, extension ignored):
 *
 *   <slug>.jpg                 -> cover image of that product/service/project
 *   product-<slug>.jpg         -> same, explicit form
 *   project-<slug>.jpg         -> same
 *   service-<slug>.jpg         -> same
 *   gallery-<slug>-2.jpg       -> gallery image #2 of that record
 *   hero-1.jpg .. hero-8.jpg   -> background of homepage hero slide 1..8
 *
 * Dry run is the DEFAULT: it only reports what it would do.
 * Add the literal word `apply` to actually upload.
 *
 *   npm run import:photos                     -> preview (safe)
 *   npm run import:photos:apply               -> upload + attach
 *   node scripts/import-photos.mjs --dir ./p  -> options, direct node call
 *
 * Options (need `node` directly: `npm run` on Windows/PowerShell strips any
 * argument that starts with a dash):
 *   --dir <path>     folder to scan (default: backend/photos-to-import)
 *   --email <e>      admin login (default: $SEED_ADMIN_EMAIL)
 *   --password <p>   admin password (default: $SEED_ADMIN_PASSWORD)
 *   --api <url>      API base URL (default: $API_URL or http://localhost:5000/api)
 *
 * The word `apply` (or --apply) is the only thing that enables uploading.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import 'dotenv/config';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.findIndex((arg) => arg === `--${name}` || arg === `-${name}`);
  return index !== -1 && args[index + 1] && !args[index + 1].startsWith('-') ? args[index + 1] : fallback;
};

const APPLY_WORDS = new Set(['apply', '--apply', '-apply', 'yes', '--yes']);
const dryRun = !args.some((arg) => APPLY_WORDS.has(arg.toLowerCase()));

const API = flag('api', process.env.API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const DIR = path.resolve(flag('dir', 'photos-to-import'));
const EMAIL = flag('email', process.env.SEED_ADMIN_EMAIL);
const PASSWORD = flag('password', process.env.SEED_ADMIN_PASSWORD);

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

/** Multer validates on MIME type, so every upload needs an explicit one. */
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

/** "Gallery Office_Partition-2.PNG" -> "gallery-office-partition-2" */
function normalize(name) {
  return path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fail(message) {
  console.error(`\n[photos] ${message}\n`);
  process.exit(1);
}

async function login() {
  if (!EMAIL || !PASSWORD) {
    fail('Missing admin credentials. Pass --email/--password or set SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD.');
  }

  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!response.ok) fail(`Login failed (${response.status}). Check the admin credentials.`);

  const body = await response.json();
  return body.data.token;
}

async function apiGet(token, url) {
  const response = await fetch(`${API}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) fail(`GET ${url} failed (${response.status}).`);
  return (await response.json()).data;
}

/** Uploads one file and returns the created media document. */
async function upload(token, filePath, alt) {
  const buffer = await readFile(filePath);
  const mimeType = MIME_TYPES[path.extname(filePath).toLowerCase()];
  if (!mimeType) fail(`Unsupported image type: ${path.extname(filePath)}`);

  const form = new FormData();
  form.append('files', new Blob([buffer], { type: mimeType }), path.basename(filePath));
  if (alt) form.append('alt', alt);

  const response = await fetch(`${API}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!response.ok) {
    fail(`Upload of ${path.basename(filePath)} failed (${response.status} ${await response.text()}).`);
  }

  const body = await response.json();
  return body.data.media;
}

async function main() {
  let files;
  try {
    files = await readdir(DIR);
  } catch {
    fail(`Folder not found: ${DIR}\nCreate it and drop your photos in (jpg/png/webp).`);
  }

  const images = files.filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  if (images.length === 0) {
    fail(`No images found in ${DIR}. Supported: ${[...IMAGE_EXTENSIONS].join(', ')}.`);
  }

  console.log(`[photos] ${images.length} image(s) found in ${DIR}`);
  console.log(
    `[photos] API ${API}\n[photos] MODE: ${
      dryRun
        ? 'PREVIEW - nothing will be uploaded. Re-run with `apply` to upload.'
        : 'APPLY - files will be uploaded and attached.'
    }\n`
  );

  const token = await login();

  const [products, services, projects] = await Promise.all([
    apiGet(token, '/products?limit=200'),
    apiGet(token, '/services?limit=200'),
    apiGet(token, '/projects?limit=200'),
  ]);
  // GET /homepage/admin wraps the document: { data: { homepage } }.
  const homepage = (await apiGet(token, '/homepage/admin')).homepage;

  // Any record can be addressed by its slug, with or without a type prefix.
  const bySlug = new Map();
  const register = (type, items) => {
    items.forEach((item) => {
      bySlug.set(item.slug, { type, item });
      bySlug.set(`${type}-${item.slug}`, { type, item });
    });
  };
  register('product', products);
  register('service', services);
  register('project', projects);

  const heroSlides = homepage?.hero?.slides || [];

  // Group files per target so gallery images are sent in one update.
  const plans = [];

  for (const file of images) {
    const key = normalize(file);
    const filePath = path.join(DIR, file);

    const heroMatch = key.match(/^hero-(\d+)$/);
    if (heroMatch) {
      const position = Number(heroMatch[1]) - 1;
      if (position < 0 || position >= heroSlides.length) {
        console.log(`  ?  ${file} -> hero slide ${heroMatch[1]} does not exist (there are ${heroSlides.length})`);
        continue;
      }
      plans.push({ kind: 'hero', file, filePath, position });
      continue;
    }

    const galleryMatch = key.match(/^gallery-(.+?)-(\d+)$/);
    if (galleryMatch) {
      const target = bySlug.get(galleryMatch[1]);
      if (!target) {
        console.log(`  ?  ${file} -> no record with slug "${galleryMatch[1]}"`);
        continue;
      }
      plans.push({ kind: 'gallery', file, filePath, target, index: Number(galleryMatch[2]) });
      continue;
    }

    const target = bySlug.get(key);
    if (!target) {
      console.log(`  ?  ${file} -> no record with slug "${key}" (skipped)`);
      continue;
    }
    plans.push({ kind: 'cover', file, filePath, target });
  }

  if (plans.length === 0) {
    console.log('\n[photos] Nothing matched. Check the naming convention in the script header.\n');
    return;
  }

  const uploads = new Map();
  if (!dryRun) {
    for (const plan of plans) {
      process.stdout.write(`[photos] uploading ${plan.file} ... `);
      const alt = plan.kind === 'hero' ? heroSlides[plan.position]?.heading || '' : plan.target?.item?.name || '';
      const media = await upload(token, plan.filePath, alt);
      const stored = Array.isArray(media) ? media[0] : media;
      uploads.set(plan.file, { url: stored.url, alt: alt || stored.originalName });
      console.log(stored.url);
    }
  }

  // --- apply ---
  const heroPatches = new Map();

  for (const plan of plans) {
    const image = uploads.get(plan.file);
    if (!image) {
      console.log(`  -  ${plan.file} -> ${describe(plan)} (dry run)`);
      continue;
    }

    if (plan.kind === 'hero') {
      const current = heroSlides[plan.position] || {};
      heroPatches.set(plan.position, {
        ...current,
        backgroundImage: { url: image.url, alt: image.alt },
      });
      console.log(`  \u2713 ${plan.file} -> hero slide ${plan.position + 1}`);
      continue;
    }

    const { type, item } = plan.target;
    const payload = {};

    if (plan.kind === 'cover') {
      if (type === 'project') payload.coverImage = image;
      else payload.image = image;
    } else {
      const existing = Array.isArray(item.gallery) ? item.gallery : [];
      const gallery = [...existing];
      gallery[plan.index - 1] = image;
      for (let i = 0; i < gallery.length; i += 1) {
        if (!gallery[i]) gallery.splice(i, 1);
      }
      payload.gallery = gallery;
    }

    const response = await fetch(`${API}/${type === 'product' ? 'products' : `${type}s`}/${item._id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) fail(`Updating ${type} "${item.name}" failed (${response.status}).`);
    console.log(`  \u2713 ${plan.file} -> ${describe(plan)}`);
  }

  if (heroPatches.size > 0 && !dryRun) {
    const slides = heroSlides.map((slide, index) => heroPatches.get(index) || slide);
    const response = await fetch(`${API}/homepage`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ hero: { slides } }),
    });
    if (!response.ok) fail(`Updating homepage hero failed (${response.status}).`);
    console.log(`[photos] hero slides updated (${heroPatches.size})`);
  }

  console.log(`\n[photos] Done. Refresh the dashboard to see the images.\n`);
}

function describe(plan) {
  if (plan.kind === 'hero') return `hero slide ${plan.position + 1}`;
  const name = plan.target.item.name;
  return plan.kind === 'gallery'
    ? `${plan.target.type} "${name}" gallery #${plan.index}`
    : `${plan.target.type} "${name}" cover`;
}

main().catch((error) => {
  console.error(`\n[photos] Unexpected error: ${error.message}\n`);
  process.exit(1);
});