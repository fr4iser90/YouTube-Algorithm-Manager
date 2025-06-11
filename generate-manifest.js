import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRESETS_DIR = path.join(__dirname, 'training-presets');
const MANIFEST_PATH = path.join(PRESETS_DIR, 'manifest.json');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.json') && file !== 'manifest.json') {
      results.push(filePath);
    }
  });
  return results;
}

function buildManifest() {
  const files = walk(PRESETS_DIR);
  const manifest = files.map(file => {
    const relPath = path.relative(PRESETS_DIR, file).replace(/\\/g, '/');
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      id: json.id || path.basename(file, '.json'),
      name: json.name || relPath,
      desc: json.description || '',
      category: json.category || '',
      subcategory: json.subcategory || '',
      path: 'training-presets/' + relPath
    };
  });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest generated with ${manifest.length} entries.`);
}

buildManifest();