import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  imageUploadOptions,
  optionalProductImagePipe,
} from '../config/multer/image-upload.config';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  createProduct(
    @Body() productData: CreateProductDto,
    @UploadedFile(optionalProductImagePipe) image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    return this.productService.createProduct(productData, image);
  }

  @Get()
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Get(':id/image')
  getProductImage(@Param('id') id: string) {
    return this.productService.getProductImage(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  updateProduct(
    @Param('id') id: string,
    @Body() productData: UpdateProductDto,
    @UploadedFile(optionalProductImagePipe) image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    return this.productService.updateProduct(id, productData, image);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
