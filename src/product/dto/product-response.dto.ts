import { Product } from '../model/product.entity';

export class ProductResponseDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly imageUrl?: string | null;

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.stock = product.stock;
    this.imageUrl = product.imageUrl;
  }
}
