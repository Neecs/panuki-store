import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { DeleteProductResponseDto } from './dto/delete-product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './model/product.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(productData: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { name: ILike(productData.name) },
    });

    if (existingProduct) {
      this.logger.warn(`Product already exists: ${productData.name}`);
      throw new ConflictException('Product already exists');
    }

    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    this.logger.log(`Product created with id ${savedProduct.id}`);
    return savedProduct;
  }

  async getAllProducts(): Promise<Product[]> {
    const products = await this.productRepository.find();

    this.logger.log(`Retrieved ${products.length} products`);
    return products;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      this.logger.warn(`Product not found: ${id}`);
      throw new NotFoundException('Product not found');
    }

    this.logger.log(`Retrieved product with id ${id}`);
    return product;
  }

  async updateProduct(
    id: string,
    productData: UpdateProductDto,
  ): Promise<Product> {
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

    Object.assign(product, productData);
    const updatedProduct = await this.productRepository.save(product);

    this.logger.log(`Product updated with id ${updatedProduct.id}`);
    return updatedProduct;
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
