import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('members')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  membershipType: string; // e.g., 'Annual Basic', 'Monthly Premium'

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  dueDate: Date; // For annual memberships

  @Column({ nullable: true })
  monthlyDueDate: Date; // For add-on services

  @Column('decimal')
  totalAmount: number; // For annual memberships

  @Column('decimal', { nullable: true })
  monthlyAmount: number; // For add-on services

  @Column()
  email: string;

  @Column({ default: true })
  isFirstMonth: boolean;

  @Column({ nullable: true })
  invoiceLink: string;
}
