import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Session } from "../sessions/session.entity";
import { Oauth } from "./authentication/oauth/oauth.entity";

@Entity('users')
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  email: string;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
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

  @OneToMany(() => Oauth, (oauth) => oauth.user)
  oauths: Oauth[];

}
