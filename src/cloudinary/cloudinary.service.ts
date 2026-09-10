import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { configureCloudinary } from '../config/cloudinary/cloudinary.config';
import { CloudinaryUploadResult } from './interfaces/cloudinary-upload-result.interface';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    configureCloudinary(this.configService);
    this.logger.log('Cloudinary configured');
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'panuki-store/products',
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed: ${error?.message}`);
            reject(
              new Error(
                error?.message ?? 'Cloudinary upload returned no result',
              ),
            );
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Deleted Cloudinary image ${publicId}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete Cloudinary image ${publicId}: ${(error as Error).message}`,
      );
    }
  }
}
