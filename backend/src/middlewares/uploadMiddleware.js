import multer from 'multer';
import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();

// Accept up to 50MB in memory, sharp will compress it before uploading
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

export const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'arturee_profiles',
      },
      (error, result) => {
        if (error) return next(error);
        req.file.path = result.secure_url;
        next();
      }
    );
    
    stream.end(buffer);
  } catch (error) {
    next(error);
  }
};

export default upload;
