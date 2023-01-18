import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";

@Entity('sessions')
export class Session {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({name: 'user_id'})
  @Index()
  user: User

  @Column()
  auth_token: string

  @CreateDateColumn({type: 'timestamptz'})
  created_at: Date;

  @Column({type: 'timestamptz'})
  end_at: Date;
}
