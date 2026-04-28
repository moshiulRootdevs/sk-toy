const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET      = process.env.AWS_S3_BUCKET;
const URL_PREFIX  = (process.env.AWS_S3_URL_PREFIX || `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`).replace(/\/$/, '');

function buildKey(folder, originalName) {
  const ext  = path.extname(originalName).toLowerCase() || '.bin';
  const id   = crypto.randomBytes(8).toString('hex');
  const ts   = Date.now();
  const now  = new Date();
  const yymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${folder}/${yymm}/${ts}-${id}${ext}`;
}

async function uploadToS3(buffer, originalName, mimetype, folder = 'general') {
  const key = buildKey(folder, originalName);
  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: mimetype,
  }));
  return `${URL_PREFIX}/${key}`;
}

function keyFromUrl(url) {
  return url.replace(`${URL_PREFIX}/`, '');
}

async function deleteFromS3(url) {
  if (!url || !url.startsWith('http')) return;
  const key = keyFromUrl(url);
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

module.exports = { uploadToS3, deleteFromS3 };
