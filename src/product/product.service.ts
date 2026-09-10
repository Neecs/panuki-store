import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { DeleteProductResponseDto } from './dto/delete-product-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './model/product.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createProduct(
    productData: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.productRepository.findOne({
      where: { name: ILike(productData.name) },
    });

    if (existingProduct) {
      this.logger.warn(`Product already exists: ${productData.name}`);
      throw new ConflictException('Product already exists');
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    if (image) {
      const uploadResult = await this.cloudinaryService.uploadImage(image);
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const product = this.productRepository.create({
      ...productData,
      imageUrl,
      imagePublicId,
    });

    try {
      const savedProduct = await this.productRepository.save(product);
      this.logger.log(`Product created with id ${savedProduct.id}`);
      return new ProductResponseDto(savedProduct);
    } catch (error) {
      if (imagePublicId) {
        await this.cloudinaryService.deleteImage(imagePublicId);
      }
      throw error;
    }
  }

  async getAllProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find();

    this.logger.log(`Retrieved ${products.length} products`);
    return products.map((product) => new ProductResponseDto(product));
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      this.logger.warn(`Product not found: ${id}`);
      throw new NotFoundException('Product not found');
    }

    this.logger.log(`Retrieved product with id ${id}`);
    return new ProductResponseDto(product);
  }

  async updateProduct(
    id: string,
    productData: UpdateProductDto,
    image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      this.logger.warn(`Product not found: ${id}`);
      throw new NotFoundException('Product not found');
    }

    if (productData.name !== undefined) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: ILike(productData.name) },
      });

      if (existingProduct && existingProduct.id !== id) {
        this.logger.warn(`Product name already exists: ${productData.name}`);
        throw new ConflictException('Product already exists');
      }
    }

    const previousImagePublicId = product.imagePublicId;

    Object.assign(product, productData);

    if (image) {
      const uploadResult = await this.cloudinaryService.uploadImage(image);
      product.imageUrl = uploadResult.url;
      product.imagePublicId = uploadResult.publicId;
    }

    const updatedProduct = await this.productRepository.save(product);

    if (image && previousImagePublicId) {
      await this.cloudinaryService.deleteImage(previousImagePublicId);
    }

    this.logger.log(`Product updated with id ${updatedProduct.id}`);
    return new ProductResponseDto(updatedProduct);
  }

  async getProductImage(id: string): Promise<{ imageUrl: string }> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      this.logger.warn(`Product not found: ${id}`);
      throw new NotFoundException('Product not found');
    }

    if (!product.imageUrl) {
      this.logger.warn(`Product has no image: ${id}`);
      throw new NotFoundException('Product has no image');
    }

    this.logger.log(`Image URL retrieved for product ${id}`);
    return { imageUrl: product.imageUrl };
  }

  async deleteProduct(id: string): Promise<DeleteProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      this.logger.warn(`Product not found: ${id}`);
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.softDelete(id);

    this.logger.log(`Product soft deleted with id ${id}`);
    return new DeleteProductResponseDto('Product deleted successfully', id);
  }
}
