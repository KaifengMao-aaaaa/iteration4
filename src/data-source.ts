import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Channel } from './entity/Channel';
import { Dm } from './entity/Dm';
import { Token } from './entity/Tokens';
import { TimePoint } from './entity/TimePoint';
import { WorkSpacePoint } from './entity/WorkSpacePoint';
import { Message } from './entity/Message';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'database-2.cgs0ie08vrtg.ap-southeast-2.rds.amazonaws.com',
  port: 3306,
  username: 'admin',
  password: '12345678',
  database: 'mydb',
  synchronize: true,
  logging: false,
  entities: [User, Channel, Dm, Token, TimePoint, WorkSpacePoint, Message],
  migrations: [],
  subscribers: [],
});
