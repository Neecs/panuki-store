import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './model/product.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
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

  getAllProducts() {
    return [
      { id: 1, name: 'Product 1', price: 10.99 },
      { id: 2, name: 'Product 2', price: 20.99 },
      { id: 3, name: 'Product 3', price: 30.99 },
    ];
  }
}
