import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configureCloudinary } from '../config/cloudinary/cloudinary.config';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    configureCloudinary(this.configService);
    this.logger.log('Cloudinary configured');
  }
}
