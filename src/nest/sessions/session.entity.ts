import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('sessions')
export class Session {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true
  })
  action_name: string;

  @Column()
  @Index()
  user_id: number

  @CreateDateColumn()
  created_at: Date;
}
