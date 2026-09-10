import { FileTypeValidator, ParseFilePipe } from '@nestjs/common';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = /^image\/(jpeg|png|webp)$/;

export const imageUploadOptions = {
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
};

export const optionalProductImagePipe = new ParseFilePipe({
  validators: [new FileTypeValidator({ fileType: ALLOWED_IMAGE_MIME_TYPES })],
  fileIsRequired: false,
});
