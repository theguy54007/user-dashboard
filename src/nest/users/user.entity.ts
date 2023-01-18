import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Session } from "../sessions/session.entity";

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
  email_verified: Boolean

  @Column({default: 0})
  sign_in_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
