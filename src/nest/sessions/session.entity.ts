import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('sessions')
export class Session {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true
  })
  actionName: string;

  @Column()
  user_id: number

  @CreateDateColumn()
  createdAt: Date;
}
