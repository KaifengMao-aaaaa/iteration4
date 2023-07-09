import { Entity, Column, BaseEntity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Dm extends BaseEntity {
    @PrimaryGeneratedColumn()
      dmId: number;

    @ManyToOne(
      () => User,
      (User) => User.dms,
      {
        onDelete: 'CASCADE'
      }
    )
    @JoinColumn({
      name: 'owner'
    })
      user: User;

    @Column('simple-array')
      allMembers: number[];

    @Column()
      time: number;

    @Column()
      name: string;
}
