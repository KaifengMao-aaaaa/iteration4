import { Entity, PrimaryColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Dm } from './Dm';
import { Token } from './Tokens';
import { TimePoint } from './TimePoint';
import { Message } from './Message';

@Entity('user')
export class User extends BaseEntity {
    @PrimaryColumn({
      unique: true
    })
      uId: number;

    @Column()
      nameFirst: string;

    @Column()
      nameLast: string;

    @Column({
      unique: true,
      nullable: true
    })
      email: string;

    @Column({
      nullable: true
    })
      password: string;

    @Column({
      unique: true
    })
      handleStr: string;

    @Column()
      role: string;

    @Column({
      nullable: true
    })
      resetCode: string;
    @Column({
      nullable: true
    })
      profileImage: string;

    @OneToMany(
      () => Dm,
      (Dm) => Dm.user,
      { cascade: true }
    )
      dms: Dm[];

    @OneToMany(
      () => Token,
      (Token) => Token.user,
      { cascade: true }
    )
      tokens: Token[];

    @OneToMany(
      () => Message,
      (message) => message.user,
      { cascade: true }
    )
      messages: Message[];

    @OneToMany(
      () => TimePoint,
      (TimePoint) => TimePoint.user,
      { cascade: true }
    )
      timePoints: Token[];

  // @ManyToMany(() => Channel,
  // channel => channel.members,{cascade: true})
  // @JoinTable({
  //   name: 'channelAndUser',
  //   joinColumn: {
  //     name: 'user',
  //     referencedColumnName: 'uId'
  //   },
  //   inverseJoinColumn: {
  //     name: 'channel',
  //     referencedColumnName: 'channelId',
  //   }
  // })
  // channels: Channel[]

  // @ManyToMany(() => Channel,channel => channel.owners,{cascade:true})
  // @JoinTable({
  //   name: 'ownerChannelAndUser',
  //   joinColumn: {
  //     name: 'user',
  //     referencedColumnName: 'uId'
  //   },

  // })
  // ownChannels: Channel[]
}
