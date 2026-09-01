import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ILike, Repository } from 'typeorm';
import { ProductService } from './product.service';
import { Product } from './model/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

type MockRepository = Partial<Record<keyof Repository<Product>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
});

describe('ProductService', () => {
  let service: ProductService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    const dto: CreateProductDto = {
      name: 'Chair',
      description: 'A comfy chair',
      price: 100,
      stock: 5,
    };

    it('creates and returns the product when no name conflict exists', async () => {
      repository.findOne!.mockResolvedValue(null);
      const createdEntity = { ...dto } as Product;
      repository.create!.mockReturnValue(createdEntity);
      const savedEntity = { id: '1', ...dto } as Product;
      repository.save!.mockResolvedValue(savedEntity);

      const result = await service.createProduct(dto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: ILike(dto.name) },
      });
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(savedEntity);
    });

    it('throws ConflictException when a product with the same name already exists', async () => {
      const existingProduct = { id: '1', ...dto } as Product;
      repository.findOne!.mockResolvedValue(existingProduct);

      await expect(service.createProduct(dto)).rejects.toThrow(
        ConflictException,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: ILike(dto.name) },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('getAllProducts', () => {
    it('returns the list of products from the repository', async () => {
      const products = [
        { id: '1', name: 'Chair' },
        { id: '2', name: 'Table' },
      ] as Product[];
      repository.find!.mockResolvedValue(products);

      const result = await service.getAllProducts();

      expect(repository.find).toHaveBeenCalledWith();
      expect(result).toEqual(products);
    });
  });

  describe('getProductById', () => {
    it('returns the product when it exists', async () => {
      const product = { id: '1', name: 'Chair' } as Product;
      repository.findOne!.mockResolvedValue(product);

      const result = await service.getProductById('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(product);
    });

    it('throws NotFoundException when the product does not exist', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.getProductById('1')).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('updateProduct', () => {
    const existingProduct = {
      id: '1',
      name: 'Chair',
      description: 'A comfy chair',
      price: 100,
      stock: 5,
    } as Product;

    it('updates and returns the product when no name change is involved', async () => {
      repository.findOne!.mockResolvedValue(existingProduct);
      const updateData = { price: 150 };
      const updatedProduct = { ...existingProduct, ...updateData };
      repository.save!.mockResolvedValue(updatedProduct);

      const result = await service.updateProduct('1', updateData);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(updatedProduct);
      expect(result).toEqual(updatedProduct);
    });

    it('updates and returns the product when the new name has no conflict', async () => {
      const updateData = { name: 'Sofa' };
      repository
        .findOne!.mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce(null);
      const updatedProduct = { ...existingProduct, ...updateData };
      repository.save!.mockResolvedValue(updatedProduct);

      const result = await service.updateProduct('1', updateData);

      expect(repository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: '1' },
      });
      expect(repository.findOne).toHaveBeenNthCalledWith(2, {
        where: { name: ILike(updateData.name) },
      });
      expect(repository.save).toHaveBeenCalledWith(updatedProduct);
      expect(result).toEqual(updatedProduct);
    });

    it('allows keeping the same name for the same product', async () => {
      const updateData = { name: 'Chair' };
      repository
        .findOne!.mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce(existingProduct);
      repository.save!.mockResolvedValue(existingProduct);

      const result = await service.updateProduct('1', updateData);

      expect(repository.save).toHaveBeenCalledWith(existingProduct);
      expect(result).toEqual(existingProduct);
    });

    it('throws NotFoundException when the product does not exist', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.updateProduct('1', { price: 150 })).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the new name belongs to another product', async () => {
      const otherProduct = { id: '2', name: 'Sofa' } as Product;
      repository
        .findOne!.mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce(otherProduct);

      await expect(
        service.updateProduct('1', { name: 'Sofa' }),
      ).rejects.toThrow(ConflictException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
