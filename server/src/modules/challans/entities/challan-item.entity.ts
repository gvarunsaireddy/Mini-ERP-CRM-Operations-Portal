import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesChallan } from './sales-challan.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('challan_items')
export class ChallanItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SalesChallan, challan => challan.items)
  @JoinColumn({ name: 'challanId' })
  challan: SalesChallan;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar' })
  productNameSnapshot: string;

  @Column({ type: 'varchar' })
  productSkuSnapshot: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: { to: (val: number) => val, from: (val: string) => parseFloat(val) } })
  productPriceSnapshot: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: { to: (val: number) => val, from: (val: string) => parseFloat(val) } })
  lineTotal: number;
}
