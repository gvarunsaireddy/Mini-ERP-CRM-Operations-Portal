import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { ChallanItem } from './challan-item.entity';

@Entity('sales_challans')
export class SalesChallan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  challanNumber: string;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'int', default: 0 })
  totalQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, transformer: { to: (val: number) => val, from: (val: string) => parseFloat(val) } })
  totalAmount: number;

  @Column({ type: 'varchar', default: 'Draft' }) // enum('Draft', 'Confirmed', 'Cancelled')
  status: string;

  @OneToMany(() => ChallanItem, item => item.challan, { cascade: true, eager: true })
  items: ChallanItem[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
