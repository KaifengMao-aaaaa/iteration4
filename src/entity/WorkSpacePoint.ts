import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { TimePointType, Method } from './TimePoint';
@Entity()
export class WorkSpacePoint extends BaseEntity {
    @PrimaryGeneratedColumn()
      pointId: number;

    @Column()
      num: number;

    @Column()
      time: number;

    @Column({
      type: 'enum',
      enum: TimePointType
    })
      type: string;

    @Column({
      type: 'enum',
      enum: Method
    })
      method: string;
}
