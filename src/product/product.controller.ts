import { Body, Controller, Get, Post } from '@nestjs/common';
import { Product } from './model/product.entity';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  createProduct(@Body() productData: Omit<Product, 'id'>) {
    return this.productService.createProduct(productData);
  }

  @Get()
  getAllProducts() {
    return this.productService.getAllProducts();
  }
}
