import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, BaseEntity } from 'typeorm';
import { User } from './User';
export enum MessageType {
    DM = 'dm message',
    CHANNEL = 'channel message',
    SYSTEM = 'system message'
}

export enum Status {
    INVALID = 'Remove',
    VALID = 'Exist',
    RUNNING = 'running'
}
@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
      messageId: number;

    @Column({
      type: 'enum',
      enum: MessageType
    })
      type: string;

    @Column()
      message: string;

    @Column()
      time:number;

    @Column({
      type: 'enum',
      enum: Status
    })
      status: string;

    @Column({
      nullable: true
    })
      channelId: number;

    @Column({
      nullable: true
    })
      dmId: number;

    @ManyToOne(
      () => User,
      (User) => User.messages,
      { onDelete: 'CASCADE' }

    )
    @JoinColumn({
      name: 'user'
    })
      user: User;
}
