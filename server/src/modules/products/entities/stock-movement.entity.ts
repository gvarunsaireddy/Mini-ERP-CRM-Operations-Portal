import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar' }) // enum('IN', 'OUT')
  movementType: string;

  @Column({ type: 'varchar' })
  reason: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}
