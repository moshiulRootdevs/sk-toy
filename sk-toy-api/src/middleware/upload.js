const multer = require('multer');
const path = require('path');
const { uploadFile } = require('../utils/storage');
const { convertToMp4 } = require('../utils/convertVideo');

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

function makeUpload(folder, maxSizeMb = 5, fileFilter = imageFilter) {
  const multerInstance = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
  });

  const storageMiddleware = async (req, res, next) => {
    try {
      if (req.file) {
        const converted = await convertToMp4(req.file.buffer, req.file.originalname, req.file.mimetype);
        req.file.buffer = converted.buffer;
        req.file.originalname = converted.originalname;
        req.file.mimetype = converted.mimetype;
        req.file.url = await uploadFile(converted.buffer, converted.originalname, converted.mimetype, folder);
      }
      if (req.files && req.files.length) {
        await Promise.all(req.files.map(async (f) => {
          const converted = await convertToMp4(f.buffer, f.originalname, f.mimetype);
          f.buffer = converted.buffer;
          f.originalname = converted.originalname;
          f.mimetype = converted.mimetype;
          f.url = await uploadFile(converted.buffer, converted.originalname, converted.mimetype, folder);
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

const uploadProduct = makeUpload('products', 200, mediaFilter);
const uploadBanner  = makeUpload('banners', 200, mediaFilter);
const uploadMedia   = makeUpload('media', 200, mediaFilter);
const uploadGeneral = makeUpload('general', 200, mediaFilter);

module.exports = { uploadProduct, uploadBanner, uploadMedia, uploadGeneral };
