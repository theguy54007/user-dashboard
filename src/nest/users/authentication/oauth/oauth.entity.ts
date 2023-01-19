import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user.entity";

export enum OauthSource{
  FB = 'fb',
  GOOGLE = 'google'
}

@Entity('oauths')
export class Oauth{

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  auth_id: string;

  @Column({
    type: 'enum',
    enum: OauthSource
  })
  source: string;

  @ManyToOne(() => User, (user) => user.oauths)
  @JoinColumn({name: 'user_id'})
  @Index()
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
