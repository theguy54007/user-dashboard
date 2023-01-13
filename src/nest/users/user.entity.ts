import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  email: string;

  @Column({
    nullable: true
  })
  name: string;

  @Column()
  password: string;

  @Column({default: false})
  emailVerified: Boolean

  @Column({
    nullable: true
  })
  lastSignInAt: Date;

  @Column({default: 0})
  signInCount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
