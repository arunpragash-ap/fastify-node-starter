import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity({ name: "options" })
export class Option {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50 })
  type!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  remarks?: string;

  @Column({ type: "boolean", default: true })
  status!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deletedAt?: Date;

  @Column({ type: "varchar", length: 36, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 36, nullable: true })
  updatedBy?: string;

  @Column({ type: "varchar", length: 36, nullable: true })
  deletedBy?: string;
}
