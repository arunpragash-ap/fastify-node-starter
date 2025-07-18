import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ length: 512 })
  refreshToken!: string;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}

