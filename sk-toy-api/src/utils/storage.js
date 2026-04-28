const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const USE_S3 = !!(
  process.env.AWS_S3_BUCKET &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
);

let s3, PutObjectCommand, DeleteObjectCommand, BUCKET, S3_URL_PREFIX;

if (USE_S3) {
  const { S3Client, PutObjectCommand: PUT, DeleteObjectCommand: DEL } = require('@aws-sdk/client-s3');
  PutObjectCommand    = PUT;
  DeleteObjectCommand = DEL;
  BUCKET = process.env.AWS_S3_BUCKET;
  S3_URL_PREFIX = (
    process.env.AWS_S3_URL_PREFIX ||
    `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`
  ).replace(/\/$/, '');
  s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir(UPLOAD_DIR);

function buildSlug(originalName) {
  const ext  = path.extname(originalName).toLowerCase() || '.bin';
  const id   = crypto.randomBytes(8).toString('hex');
  const ts   = Date.now();
  const now  = new Date();
  const yymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return { ext, id, ts, yymm };
}

async function uploadToS3(buffer, originalName, mimetype, folder) {
  const { ext, ts, id, yymm } = buildSlug(originalName);
  const key = `${folder}/${yymm}/${ts}-${id}${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));
  return `${S3_URL_PREFIX}/${key}`;
}

async function uploadToLocal(buffer, originalName, folder) {
  const { ext, ts, id, yymm } = buildSlug(originalName);
  const subDir = path.join(UPLOAD_DIR, folder, yymm);
  ensureDir(subDir);
  const filename = `${ts}-${id}${ext}`;
  fs.writeFileSync(path.join(subDir, filename), buffer);
  return `/uploads/${folder}/${yymm}/${filename}`;
}

async function uploadFile(buffer, originalName, mimetype, folder = 'general') {
  if (USE_S3) {
    try {
      return await uploadToS3(buffer, originalName, mimetype, folder);
    } catch (err) {
      console.warn('S3 upload failed, falling back to local storage:', err.message);
    }
  }
  return uploadToLocal(buffer, originalName, folder);
}

async function deleteFile(url) {
  if (!url) return;
  if (USE_S3 && S3_URL_PREFIX && url.startsWith(S3_URL_PREFIX)) {
    const key = url.replace(`${S3_URL_PREFIX}/`, '');
    try { await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })); } catch {}
    return;
  }
  if (url.startsWith('/uploads/')) {
    const fullPath = path.join(UPLOAD_DIR, url.replace('/uploads/', ''));
    try { fs.unlinkSync(fullPath); } catch {}
  }
}

module.exports = { uploadFile, deleteFile };
