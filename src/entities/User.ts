import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 30 })
  username!: string;

  @Column({ length: 255 })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: 'enum', enum: ['admin', 'user', 'moderator'], default: 'user' })
  userType!: 'admin' | 'user' | 'moderator';

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ default: false })
  mfaEnabled!: boolean;

  @Column({ nullable: true, select: false })
  mfaSecret?: string;

  @Column({ nullable: true, select: false })
  emailVerificationToken?: string;

  @Column({ type: 'datetime', nullable: true, select: false })
  emailVerificationExpires?: Date;

  @Column({ nullable: true, select: false })
  forgotPasswordOtp?: string;

  @Column({ type: 'datetime', nullable: true, select: false })
  forgotPasswordExpires?: Date;

  @Column({ type: 'datetime', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

