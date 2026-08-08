import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('customer_followups')
export class CustomerFollowUp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'text' })
  notes: string;

  @Column({ type: 'date', nullable: true })
  nextFollowUpDate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}
