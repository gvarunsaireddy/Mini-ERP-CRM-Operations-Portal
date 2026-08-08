import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  sku: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: { to: (val: number) => val, from: (val: string) => parseFloat(val) } })
  unitPrice: number;

  @Column({ type: 'int', default: 0 })
  currentStock: number;

  @Column({ type: 'int', default: 10 })
  minStockAlert: number;

  @Column({ type: 'varchar' })
  warehouseLocation: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
