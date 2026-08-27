import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 70 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'integer' })
  stock!: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
}
