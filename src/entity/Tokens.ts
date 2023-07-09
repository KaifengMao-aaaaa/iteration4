import { Entity, PrimaryColumn, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Token extends BaseEntity {
    @PrimaryColumn({
      unique: true
    })
      token: string;

    @ManyToOne(
      () => User,
      (User) => User.tokens, { onDelete: 'CASCADE' }

    )
    @JoinColumn()
      user: User;
}
