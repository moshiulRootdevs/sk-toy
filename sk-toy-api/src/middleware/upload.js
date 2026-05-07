const multer = require('multer');
const path = require('path');
const { uploadFile } = require('../utils/storage');

const imageFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|gif|webp|svg/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) return cb(null, true);
  cb(new Error('Only image files are allowed'), false);
};

const mediaFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico|mp4|webm|mov|ogg|avi|mkv|m4v|3gp/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) return cb(null, true);
  cb(new Error('Only image or video files are allowed'), false);
};

/**
 * Process a single file: upload to storage.
 * Returns true on success, false on failure (file is marked with f.uploadError).
 */
async function processFile(f, folder) {
  try {
    f.url = await uploadFile(f.buffer, f.originalname, f.mimetype, folder);
    return true;
  } catch (err) {
    console.error(`[upload] Failed to process file "${f.originalname}":`, err.message);
    f.uploadError = err.message;
    return false;
  }
}

function makeUpload(folder, maxSizeMb = 5, fileFilter = imageFilter) {
  const multerInstance = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
  });

  const storageMiddleware = async (req, res, next) => {
    try {
      if (req.file) {
        const ok = await processFile(req.file, folder);
        if (!ok) {
          return next(new Error(`Upload failed: ${req.file.uploadError}`));
        }
      }
      if (req.files && req.files.length) {
        // Process files sequentially to avoid memory pressure from parallel video conversions
        for (const f of req.files) {
          await processFile(f, folder);
        }
        // Filter out failed files but continue with successful ones
        const failed = req.files.filter(f => f.uploadError);
        req.files = req.files.filter(f => !f.uploadError);

        if (failed.length && !req.files.length) {
          // All files failed — report error
          return next(new Error(`All uploads failed. First error: ${failed[0].uploadError}`));
        }
        if (failed.length) {
          // Some files failed — attach info for the route handler to report
          req.uploadErrors = failed.map(f => ({ name: f.originalname, error: f.uploadError }));
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };

  return {
    single: (field)      => [multerInstance.single(field), storageMiddleware],
    array:  (field, max) => [multerInstance.array(field, max ?? 10), storageMiddleware],
  };
}

const uploadProduct = makeUpload('products', 200, mediaFilter);
const uploadBanner  = makeUpload('banners', 200, mediaFilter);
const uploadMedia   = makeUpload('media', 200, mediaFilter);
const uploadGeneral = makeUpload('general', 200, mediaFilter);

module.exports = { uploadProduct, uploadBanner, uploadMedia, uploadGeneral };
