import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  createProduct(@Body() productData: CreateProductDto) {
    return this.productService.createProduct(productData);
  }

  @Get()
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() productData: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, productData);
  }
}
