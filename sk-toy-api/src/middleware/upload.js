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
  const allowed = /jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|ogg/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) return cb(null, true);
  cb(new Error('Only image or video files are allowed'), false);
};

function makeUpload(folder, maxSizeMb = 5, fileFilter = imageFilter) {
  const multerInstance = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
  });

  const storageMiddleware = async (req, res, next) => {
    try {
      if (req.file) {
        req.file.url = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, folder);
      }
      if (req.files && req.files.length) {
        await Promise.all(req.files.map(async (f) => {
          f.url = await uploadFile(f.buffer, f.originalname, f.mimetype, folder);
        }));
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

const uploadProduct = makeUpload('products');
const uploadBanner  = makeUpload('banners');
const uploadMedia   = makeUpload('media', 200, mediaFilter);
const uploadGeneral = makeUpload('general');

module.exports = { uploadProduct, uploadBanner, uploadMedia, uploadGeneral };
