import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { randomBytes } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');
export const MAX_PHOTOS = 6;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const photoUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED_TYPES.has(file.mimetype)
      ? cb(null, true)
      : cb(new BadRequestException('Only JPEG, PNG or WebP images are allowed'), false),
};

export async function removeUploads(filenames: string[]) {
  await Promise.all(filenames.map((name) => unlink(join(UPLOAD_DIR, name)).catch(() => undefined)));
}
