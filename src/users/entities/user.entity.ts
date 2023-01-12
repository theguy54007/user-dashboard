import { Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export class User {

  @PrimaryColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({default: false})
  isConfirm: Boolean

  @Column()
  lastSignInAt: Date;

  @Column({default: 0})
  signInCount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
