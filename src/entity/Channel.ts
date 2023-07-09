import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';
import { messages } from '../dataStore';

@Entity()
export class Channel extends BaseEntity {
    @PrimaryColumn({
      unique: true
    })
      channelId: number;

    @Column()
      name: string;

    @Column()
      isPublic: boolean;

    @Column('simple-array')
      members : number[];

    @Column('simple-array')
      owners : number[];

    @Column('simple-array')
      messages: messages[];

    @Column()
      time: number;

    @Column('simple-array')
      standupBuffer: string[];

    @Column({
      default: false
    })
      isActive: boolean;

    @Column({
      nullable: true
    })
      timeFinish: number;

    @Column({
      nullable: true
    })
      standupStarter: number;

    @Column('simple-json')
      checkTable: {hangmanStart: boolean, hangmanWord: string|undefined, word: string[]|undefined, stage: number, leaveLetters: string[]|undefined};
}
