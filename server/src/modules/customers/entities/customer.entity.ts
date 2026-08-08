import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  mobile: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar' })
  businessName: string;

  @Column({ type: 'varchar', nullable: true })
  gstNumber: string;

  @Column({ type: 'varchar' }) // enum('Retail', 'Wholesale', 'Distributor')
  customerType: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', default: 'Lead' }) // enum('Lead', 'Active', 'Inactive')
  status: string;

  @Column({ type: 'date', nullable: true })
  followUpDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
