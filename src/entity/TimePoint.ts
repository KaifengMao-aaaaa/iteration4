import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, BaseEntity } from 'typeorm';
import { User } from './User';
export enum TimePointType {
    MESSAGE = 'message',
    DM = 'dm',
    CHANNEL = 'channel',
    USER = 'user',
    HANGMAN = "hangman"
}

export enum Method {
    INCREASE = 'increase',
    DECREASE = 'decrease',
    INIT = 'init'
}
@Entity()
export class TimePoint extends BaseEntity {
    @PrimaryGeneratedColumn()
      pointId: number;

    @Column()
      num: number;

    @Column({
      type: 'enum',
      enum: TimePointType
    })
      type: string;

    @Column()
      time: number;

    @Column({
      type: 'enum',
      enum: Method
    })
      method: string;

    @ManyToOne(
      () => User,
      (User) => User.timePoints,
      { onDelete: 'CASCADE' }

    )
    @JoinColumn({
      name: 'user'
    })
      user: User;
}
