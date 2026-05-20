const fs = require('fs');
const path = require('path');

const UPLOADS_BASE_DIR = path.resolve(__dirname, '../../uploads');

/**
 * Ensures a directory exists recursively under the uploads root.
 * @param {string} relativeSubdir e.g., 'artworks', 'profiles', 'exhibitions'
 * @returns {string} The absolute path to the directory
 */
function ensureDirExists(relativeSubdir) {
  const targetDir = path.join(UPLOADS_BASE_DIR, relativeSubdir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`[AssetHelper] Created directory: ${targetDir}`);
  }
  return targetDir;
}

/**
 * Safely copies a seed asset from uploads/seeding to the destination directory,
 * only if the destination file does not already exist.
 * @param {string} filename The name of the file in uploads/seeding/
 * @param {string} relativeSubdir The target subdirectory (e.g. 'artworks')
 * @returns {string} The relative database path (e.g. '/uploads/artworks/filename')
 */
function copySeedAssetSafely(filename, relativeSubdir) {
  // Ensure target directory exists first
  const targetDir = ensureDirExists(relativeSubdir);

  const sourcePath = path.join(UPLOADS_BASE_DIR, 'seeding', filename);
  const targetPath = path.join(targetDir, filename);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`[AssetHelper] Warning: Seeding source file does not exist: ${sourcePath}`);
    return `/uploads/${relativeSubdir}/${filename}`;
  }

  // Only copy if destination file does not exist to avoid overwriting user uploads
  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`[AssetHelper] Copied seed asset to runtime folder: ${relativeSubdir}/${filename}`);
  } else {
    console.log(`[AssetHelper] Skip copy: ${relativeSubdir}/${filename} already exists.`);
  }

  return `/uploads/${relativeSubdir}/${filename}`;
}

/**
 * Normalizes an uploaded file path to the standard format.
 * @param {string} relativePath e.g. 'artworks/image-123.jpg'
 * @returns {string} e.g. '/uploads/artworks/image-123.jpg'
 */
function normalizeUploadPath(relativePath) {
  if (!relativePath) return '';
  const cleanPath = relativePath.replace(/\\/g, '/');
  if (cleanPath.startsWith('/uploads/')) return cleanPath;
  if (cleanPath.startsWith('uploads/')) return `/${cleanPath}`;
  return `/uploads/${cleanPath}`;
}

module.exports = {
  UPLOADS_BASE_DIR,
  ensureDirExists,
  copySeedAssetSafely,
  normalizeUploadPath
};
